import { readJson, writeJson } from '@/features/storage/services/json-storage-service';

import type { SellerOrder, OrderStatus } from '../types/order';
import type { SellerProduct } from '../types/product';
import type { InventoryActivity } from '../types/inventory';
import {
  notifyOrderRecipients,
  createNotification,
} from '@/features/notifications/services/notification-service';

const productsKey = 'products.json';
const ordersKey = 'orders.json';
const activitiesKey = 'inventory-activities.json';

type ProductsFile = { products: SellerProduct[] };
type OrdersFile = { orders: SellerOrder[] };
type ActivitiesFile = { activities: InventoryActivity[] };

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'processing', 'cancelled'],
  paid: ['processing', 'cancelled', 'refund_requested'],
  processing: ['ready_to_deliver', 'cancelled', 'refund_requested'],
  ready_to_deliver: ['out_for_delivery', 'cancelled', 'refund_requested'],
  out_for_delivery: ['delivered', 'cancelled', 'refund_requested'],
  delivered: ['refund_requested'],
  cancelled: [],
  refund_requested: ['refunded', 'cancelled'],
  refunded: [],
};

function assertInventory(product: SellerProduct) {
  const { quantity, reservedQuantity, availableQuantity } = product.inventory;
  if (
    quantity < 0 ||
    reservedQuantity < 0 ||
    availableQuantity < 0 ||
    reservedQuantity > quantity ||
    availableQuantity !== quantity - reservedQuantity
  ) {
    throw new Error(`Inventory invariant failed for ${product.id}.`);
  }
}

function activity(
  product: SellerProduct,
  type: InventoryActivity['type'],
  quantity: number,
  before: number,
  after: number,
  reason: string,
  orderId?: string,
): InventoryActivity {
  return {
    id: `INVENTORY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId: product.id,
    vendorId: product.vendorId,
    sellerId: product.sellerId,
    productName: product.name,
    sku: product.inventory.sku,
    type,
    quantity,
    quantityBefore: before,
    quantityAfter: after,
    availableQuantityBefore: before - product.inventory.reservedQuantity,
    availableQuantityAfter: after - product.inventory.reservedQuantity,
    reason,
    orderId,
    createdAt: new Date().toISOString(),
  };
}

export async function confirmPayment(orderId: string, transactionId: string | null = null) {
  const orders = await readJson<OrdersFile>(ordersKey, { orders: [] });
  const order = orders.orders.find((item) => item.id === orderId);
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  if (order.status !== 'pending_payment' || !['pending', 'failed'].includes(order.payment.status)) {
    throw Object.assign(new Error('This order is not eligible for payment confirmation.'), {
      status: 409,
    });
  }

  const now = new Date().toISOString();
  order.status = 'paid';
  order.payment.status = 'paid';
  order.payment.transactionId = transactionId;
  order.payment.paidAt = now;
  order.updatedAt = now;
  order.timeline.push({ status: 'paid', changedBy: 'payment-system', timestamp: now });
  await writeJson(ordersKey, orders);
  try {
    await notifyOrderRecipients(order, {
      type: 'payment',
      title: 'Payment Successful',
      buyerMessage: `Payment for order #${order.orderNumber} was successfully confirmed.`,
      sellerMessage: 'Payment has been confirmed for an order containing your product.',
    });
  } catch (error) {
    console.error('[notifications] payment-success notification failed', error);
  }
  return order;
}

export async function markPaymentReceived(orderId: string, actor: string) {
  const orders = await readJson<OrdersFile>(ordersKey, { orders: [] });
  const order = orders.orders.find((item) => item.id === orderId);
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  if (order.payment.status === 'paid') return order;
  if (order.payment.status !== 'pending') {
    throw Object.assign(new Error('Only pending payments can be marked received.'), {
      status: 409,
    });
  }

  const now = new Date().toISOString();
  order.payment.status = 'paid';
  order.payment.paidAt = now;
  order.payment.transactionId ??= `SELLER-${actor}-${Date.now()}`;
  order.updatedAt = now;
  await writeJson(ordersKey, orders);
  try {
    await createNotification({
      recipientId: order.buyerId,
      recipientRole: 'buyer',
      type: 'payment',
      title: 'Payment Received',
      message: `Payment received for order #${order.orderNumber}.`,
      entityType: 'order',
      entityId: order.id,
      actionUrl: `/orders/${order.id}`,
    });
  } catch (error) {
    console.error('[notifications] payment-received notification failed', error);
  }
  return order;
}

export async function failPayment(orderId: string, reason = 'Mock payment failed.') {
  const orders = await readJson<OrdersFile>(ordersKey, { orders: [] });
  const order = orders.orders.find((item) => item.id === orderId);
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  if (order.status !== 'pending_payment' || !['pending', 'failed'].includes(order.payment.status)) {
    throw Object.assign(new Error('This order is not eligible for payment failure.'), {
      status: 409,
    });
  }
  order.payment.status = 'failed';
  order.payment.transactionId = null;
  order.payment.paidAt = null;
  order.updatedAt = new Date().toISOString();
  await writeJson(ordersKey, orders);
  try {
    await createNotification({
      recipientId: order.buyerId,
      recipientRole: 'buyer',
      type: 'payment',
      title: 'Payment Failed',
      message: `Payment for order #${order.orderNumber} was not completed. You can try again.`,
      entityType: 'order',
      entityId: order.id,
      actionUrl: `/payment/${order.id}`,
    });
  } catch (error) {
    console.error('[notifications] payment-failure notification failed', error);
  }
  return { ...order, failureReason: reason };
}

export async function transitionOrder(orderId: string, nextStatus: OrderStatus, actor: string) {
  const [orders, products, activities] = await Promise.all([
    readJson<OrdersFile>(ordersKey, { orders: [] }),
    readJson<ProductsFile>(productsKey, { products: [] }),
    readJson<ActivitiesFile>(activitiesKey, { activities: [] }),
  ]);
  const order = orders.orders.find((item) => item.id === orderId);
  if (!order) throw Object.assign(new Error('Order not found.'), { status: 404 });
  if (!ORDER_TRANSITIONS[order.status].includes(nextStatus)) {
    throw Object.assign(new Error(`Invalid order transition: ${order.status} to ${nextStatus}.`), {
      status: 409,
    });
  }
  if (nextStatus === 'delivered' && order.payment.status !== 'paid') {
    throw Object.assign(new Error('Payment must be confirmed before delivery is completed.'), {
      status: 400,
    });
  }

  if (nextStatus === 'processing') {
    const requested = new Map<string, number>();
    for (const item of order.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw Object.assign(new Error('Order quantities must be positive whole numbers.'), {
          status: 400,
        });
      }
      requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity);
    }

    const productsToReserve = [...requested.entries()].map(([productId, quantity]) => {
      const product = products.products.find((candidate) => candidate.id === productId);
      if (!product || product.status !== 'approved') {
        throw Object.assign(new Error('Product is unavailable.'), { status: 409 });
      }
      if (product.inventory.availableQuantity < quantity) {
        throw Object.assign(new Error('Insufficient stock available.'), { status: 409 });
      }
      return { product, quantity };
    });

    for (const { product, quantity } of productsToReserve) {
      product.inventory.reservedQuantity += quantity;
      product.inventory.availableQuantity =
        product.inventory.quantity - product.inventory.reservedQuantity;
      assertInventory(product);
      activities.activities.unshift(
        activity(
          product,
          'reserved',
          quantity,
          product.inventory.quantity,
          product.inventory.quantity,
          `Reserved for ${order.id}`,
          order.id,
        ),
      );
    }
  }

  if (
    nextStatus === 'cancelled' &&
    !['cancelled', 'delivered', 'refunded'].includes(order.status)
  ) {
    for (const item of order.items) {
      const product = products.products.find((candidate) => candidate.id === item.productId);
      if (product && product.inventory.reservedQuantity >= item.quantity) {
        product.inventory.reservedQuantity -= item.quantity;
        product.inventory.availableQuantity =
          product.inventory.quantity - product.inventory.reservedQuantity;
        assertInventory(product);
        activities.activities.unshift(
          activity(
            product,
            'released',
            item.quantity,
            product.inventory.quantity,
            product.inventory.quantity,
            `Released for ${order.id}`,
            order.id,
          ),
        );
      }
    }
  }

  if (nextStatus === 'delivered') {
    for (const item of order.items) {
      const product = products.products.find((candidate) => candidate.id === item.productId);
      if (!product || product.inventory.reservedQuantity < item.quantity)
        throw Object.assign(new Error('Reserved inventory is unavailable.'), { status: 409 });
      product.inventory.quantity -= item.quantity;
      product.inventory.reservedQuantity -= item.quantity;
      product.inventory.availableQuantity =
        product.inventory.quantity - product.inventory.reservedQuantity;
      product.soldCount += item.quantity;
      assertInventory(product);
      activities.activities.unshift(
        activity(
          product,
          'finalized',
          item.quantity,
          product.inventory.quantity + item.quantity,
          product.inventory.quantity,
          `Finalized for ${order.id}`,
          order.id,
        ),
      );
    }
  }

  const now = new Date().toISOString();
  order.status = nextStatus;
  order.updatedAt = now;
  order.timeline.push({ status: nextStatus, changedBy: actor, timestamp: now });
  if (nextStatus === 'refunded') order.payment.status = 'refunded';

  await writeJson(productsKey, products);
  await writeJson(ordersKey, orders);
  await writeJson(activitiesKey, activities);
  const transitionMessages: Partial<
    Record<OrderStatus, { title: string; message: string; type: 'order' | 'payment' }>
  > = {
    processing: {
      title: 'Order Processing',
      message: `Your order #${order.orderNumber} is now being processed.`,
      type: 'order',
    },
    ready_to_deliver: {
      title: 'Order Ready',
      message: `Your order #${order.orderNumber} is ready for delivery.`,
      type: 'order',
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      message: `Your order #${order.orderNumber} is on its way.`,
      type: 'order',
    },
    delivered: {
      title: 'Order Delivered',
      message: `Your order #${order.orderNumber} has been delivered.`,
      type: 'order',
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been cancelled.`,
      type: 'order',
    },
    refunded: {
      title: 'Order Refunded',
      message: `Your refund for order #${order.orderNumber} has been completed.`,
      type: 'payment',
    },
    refund_requested: {
      title: 'Refund Requested',
      message: `A refund was requested for order #${order.orderNumber}.`,
      type: 'payment',
    },
  };
  const event = transitionMessages[nextStatus];
  if (event)
    try {
      await notifyOrderRecipients(order, {
        type: event.type,
        title: event.title,
        buyerMessage: event.message,
        sellerMessage:
          nextStatus === 'processing'
            ? 'A paid order is waiting for seller processing.'
            : nextStatus === 'cancelled'
              ? 'An order containing your product has been cancelled.'
              : nextStatus === 'refund_requested'
                ? 'A refund has been requested for an order containing your product.'
                : undefined,
      });
    } catch (error) {
      console.error('[notifications] order-transition notification failed', error);
    }
  return order;
}

export async function loadOrder(orderId: string) {
  const orders = await readJson<OrdersFile>(ordersKey, { orders: [] });
  return orders.orders.find((item) => item.id === orderId) ?? null;
}

// placeholder
