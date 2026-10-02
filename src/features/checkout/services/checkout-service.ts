import type { SellerOrder, PaymentMethod, ShippingAddress } from '@/features/sellers/types/order';

import {
  readJson,
  readSeedJson,
  writeJson,
} from '@/features/storage/services/json-storage-service';
import { createNotification } from '@/features/notifications/services/notification-service';
import {
  loadMarketplaceProducts,
  getAvailableQuantity,
  getCurrentPrice,
} from '@/features/marketplace/services/marketplace-service';

const ordersKey = 'orders.json';
const usersKey = 'users.json';

const SHIPPING_FEE = 0;
const paymentMethods: PaymentMethod[] = ['online', 'cash_on_delivery'];

type UsersFile = { users: Array<{ id: string; roles: string[]; status: string }> };
type OrdersFile = { orders: SellerOrder[] };
export interface CheckoutItemInput {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
}
export interface CheckoutInput {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  buyerId?: string;
}

export function validateShippingAddress(address: ShippingAddress) {
  return ['fullName', 'phone', 'province', 'district', 'city', 'street', 'postalCode'].every(
    (key) =>
      typeof address[key as keyof ShippingAddress] === 'string' &&
      String(address[key as keyof ShippingAddress]).trim().length > 0,
  );
}
function nextId(orders: SellerOrder[]) {
  const max = orders.reduce(
    (value, order) => Math.max(value, Number(order.id.replace('ORD-', '')) || 0),
    0,
  );
  return `ORD-${String(max + 1).padStart(6, '0')}`;
}
function orderNumber(id: string) {
  return `SC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${id.replace('ORD-', '')}`;
}

export async function resolveBuyerId(token: string | null, guestId?: string) {
  if (!token) return guestId ? `GUEST-${guestId}` : null;
  const match = /^demo-user-token-(.+)$/.exec(token);
  if (!match) return guestId ? `GUEST-${guestId}` : null;
  const users = await readJson<UsersFile>(usersKey, await readSeedJson<UsersFile>(usersKey));
  const user = users.users.find(
    (candidate) =>
      candidate.id === match[1] &&
      candidate.status === 'active' &&
      candidate.roles.includes('buyer'),
  );
  return user?.id ?? (guestId ? `GUEST-${guestId}` : null);
}

export async function createCheckoutOrder(items: CheckoutItemInput[], input: CheckoutInput) {
  if (
    !paymentMethods.includes(input.paymentMethod) ||
    !validateShippingAddress(input.shippingAddress)
  )
    throw Object.assign(new Error('Valid shipping information and payment method are required.'), {
      status: 400,
    });
  if (!Array.isArray(items) || !items.length)
    throw Object.assign(new Error('Your cart is empty.'), { status: 400 });
  const products = await loadMarketplaceProducts();
  const checkedItems = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product)
      throw Object.assign(new Error(`Product ${item.productId} is no longer available.`), {
        status: 409,
      });
    const variant = item.selectedVariantId
      ? product.variants.find((candidate) => candidate.id === item.selectedVariantId)
      : null;
    if (item.selectedVariantId && !variant)
      throw Object.assign(new Error(`Selected variant for ${product.name} is invalid.`), {
        status: 400,
      });
    const availableQuantity = getAvailableQuantity(product, item.selectedVariantId);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > availableQuantity)
      throw Object.assign(new Error(`${product.name} does not have enough stock.`), {
        status: 409,
      });
    const unitPrice = getCurrentPrice(product, item.selectedVariantId);
    return {
      product,
      variant,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    };
  });
  const subtotal = checkedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const orders = await readJson<OrdersFile>(ordersKey, await readSeedJson<OrdersFile>(ordersKey));
  const buyerId = input.buyerId ?? 'GUEST-checkout';
  const now = new Date().toISOString();
  const id = nextId(orders.orders);
  const order: SellerOrder = {
    id,
    orderNumber: orderNumber(id),
    buyerId,
    vendorId: checkedItems[0].product.vendorId,
    sellerId: checkedItems[0].product.sellerId,
    items: checkedItems.map(({ product, variant, quantity, unitPrice, totalPrice }) => ({
      productId: product.id,
      sellerId: product.sellerId,
      vendorId: product.vendorId,
      name: product.name,
      sku: variant?.sku ?? product.inventory.sku,
      quantity,
      unitPrice,
      totalPrice,
    })),
    pricing: {
      subtotal,
      deliveryFee: SHIPPING_FEE,
      discount: 0,
      tax: 0,
      total: subtotal + SHIPPING_FEE,
    },
    paymentId: `PAY-${id.replace('ORD-', '')}`,
    payment: { method: input.paymentMethod, status: 'pending', transactionId: null, paidAt: null },
    status: 'pending_payment',
    shippingAddress: input.shippingAddress,
    customerNote: null,
    timeline: [{ status: 'pending_payment', changedBy: buyerId, timestamp: now }],
    createdAt: now,
    updatedAt: now,
  };
  orders.orders.push(order);
  await writeJson(ordersKey, orders);
  try {
    await createNotification({
      recipientId: buyerId,
      recipientRole: 'buyer',
      type: 'order',
      title: 'Order Placed',
      message: `Your order #${order.orderNumber} has been placed successfully.`,
      entityType: 'order',
      entityId: order.id,
      actionUrl: `/orders/${order.id}`,
    });
  } catch (error) {
    console.error('[notifications] order-created notification failed', error);
  }
  return order;
}

export async function getBuyerOrders(buyerId: string) {
  const orders = await readJson<OrdersFile>(ordersKey, await readSeedJson<OrdersFile>(ordersKey));
  return orders.orders.filter((order) => order.buyerId === buyerId);
}
export async function getBuyerOrder(buyerId: string, id: string) {
  const orders = await getBuyerOrders(buyerId);
  return orders.find((order) => order.id === id) ?? null;
}
export { SHIPPING_FEE };
