import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SellerOrder } from '@/features/sellers/types/order';
import type { SellerProduct } from '@/features/sellers/types/product';

const files = new Map<string, string>();

vi.mock('fs/promises', () => {
  const readFile = vi.fn(async (file: string) => {
    const value = files.get(file);
    if (value === undefined) throw new Error(`Missing test fixture: ${file}`);
    return value;
  });
  const writeFile = vi.fn(async (file: string, value: string) => {
    files.set(file.replace(/\\.\d+\.tmp$/, ''), value);
  });
  const rename = vi.fn(async (from: string, to: string) => {
    const value = files.get(from);
    if (value === undefined) throw new Error(`Missing temporary fixture: ${from}`);
    files.set(to, value);
    files.delete(from);
  });
  return { default: { readFile, writeFile, rename }, readFile, writeFile, rename };
});

const dataPath = (name: string) => `${process.cwd()}/src/data/${name}`;
const productsPath = dataPath('products.json');
const ordersPath = dataPath('orders.json');
const activitiesPath = dataPath('inventory-activities.json');

function product(overrides: Partial<SellerProduct> = {}): SellerProduct {
  return {
    id: 'PROD-A',
    vendorId: 'VEN-A',
    sellerId: 'SEL-A',
    categoryId: 'CAT',
    subcategoryId: null,
    name: 'Test product',
    slug: 'test-product',
    brand: 'Test',
    model: '1',
    description: 'Test',
    shortDescription: 'Test',
    images: [],
    video: null,
    pricing: { regularPrice: 100, salePrice: 100, currency: 'NPR', discountPercentage: 0 },
    inventory: {
      sku: 'SKU-A',
      barcode: 'BAR-A',
      quantity: 25,
      reservedQuantity: 0,
      availableQuantity: 25,
      lowStockThreshold: 2,
    },
    variants: [],
    attributes: {},
    shipping: { freeShipping: true, shippingFee: 0, estimatedDeliveryDays: '2' },
    returnPolicy: { returnable: true, returnDays: 7 },
    commission: { influencerPercentage: 0, affiliatePercentage: 0 },
    rating: { average: 0, count: 0 },
    soldCount: 0,
    viewCount: 0,
    status: 'approved',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function order(overrides: Partial<SellerOrder> = {}): SellerOrder {
  return {
    id: 'ORD-A',
    orderNumber: 'ORD-A',
    buyerId: 'BUYER-A',
    vendorId: 'VEN-A',
    sellerId: 'SEL-A',
    items: [
      {
        productId: 'PROD-A',
        sellerId: 'SEL-A',
        vendorId: 'VEN-A',
        name: 'Test product',
        sku: 'SKU-A',
        quantity: 3,
        unitPrice: 100,
        totalPrice: 300,
      },
    ],
    pricing: { subtotal: 300, deliveryFee: 0, discount: 0, tax: 0, total: 300 },
    paymentId: 'PAY-A',
    payment: { method: 'online', status: 'pending', transactionId: null, paidAt: null },
    status: 'pending_payment',
    shippingAddress: {
      fullName: 'Buyer',
      phone: '9800000000',
      province: 'Bagmati',
      district: 'Kathmandu',
      city: 'Kathmandu',
      street: 'Test',
      postalCode: '44600',
    },
    customerNote: null,
    timeline: [
      { status: 'pending_payment', changedBy: 'test', timestamp: '2026-01-01T00:00:00.000Z' },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function seed(products: SellerProduct[], orders: SellerOrder[]) {
  files.clear();
  files.set(productsPath, JSON.stringify({ products }));
  files.set(ordersPath, JSON.stringify({ orders }));
  files.set(activitiesPath, JSON.stringify({ activities: [] }));
}

async function workflow() {
  return import('@/features/sellers/services/order-inventory-workflow');
}

function savedProducts() {
  return JSON.parse(files.get(productsPath) ?? '{}').products as SellerProduct[];
}

beforeEach(() => seed([product()], [order()]));

describe('payment confirmation and inventory workflow', () => {
  it('confirms mock payment without reserving inventory and rejects duplicates', async () => {
    const { confirmPayment } = await workflow();
    const paid = await confirmPayment('ORD-A', 'TXN-A');
    expect(paid.status).toBe('paid');
    expect(paid.payment.status).toBe('paid');
    expect(savedProducts()[0].inventory).toMatchObject({
      quantity: 25,
      reservedQuantity: 0,
      availableQuantity: 25,
    });
    await expect(confirmPayment('ORD-A')).rejects.toMatchObject({ status: 409 });
  });

  it('marks mock failures without inventory changes and allows retry', async () => {
    const { confirmPayment, failPayment } = await workflow();
    await failPayment('ORD-A');
    const failed = JSON.parse(files.get(ordersPath) ?? '{}').orders[0] as SellerOrder;
    expect(failed.status).toBe('pending_payment');
    expect(failed.payment.status).toBe('failed');
    expect(savedProducts()[0].inventory.reservedQuantity).toBe(0);
    await confirmPayment('ORD-A', 'MOCK-TXN-RETRY');
    const retried = JSON.parse(files.get(ordersPath) ?? '{}').orders[0] as SellerOrder;
    expect(retried.status).toBe('paid');
    expect(retried.payment.transactionId).toBe('MOCK-TXN-RETRY');
  });

  it('reserves stock only when a paid order moves to processing', async () => {
    const { confirmPayment, transitionOrder } = await workflow();
    await confirmPayment('ORD-A');
    await transitionOrder('ORD-A', 'processing', 'SEL-A');
    expect(savedProducts()[0].inventory).toMatchObject({
      quantity: 25,
      reservedQuantity: 3,
      availableQuantity: 22,
    });
    expect(JSON.parse(files.get(activitiesPath) ?? '{}').activities[0].type).toBe('reserved');
  });

  it('allows seller processing before payment confirmation', async () => {
    const { transitionOrder } = await workflow();
    const processing = await transitionOrder('ORD-A', 'processing', 'SEL-A');
    expect(processing.status).toBe('processing');
    expect(processing.payment.status).toBe('pending');
    expect(savedProducts()[0].inventory.reservedQuantity).toBe(3);
  });

  it('allows pending payment through delivery preparation states', async () => {
    const { transitionOrder } = await workflow();
    await transitionOrder('ORD-A', 'processing', 'SEL-A');
    await transitionOrder('ORD-A', 'ready_to_deliver', 'SEL-A');
    const dispatched = await transitionOrder('ORD-A', 'out_for_delivery', 'SEL-A');
    expect(dispatched.status).toBe('out_for_delivery');
    expect(dispatched.payment.status).toBe('pending');
  });

  it('marks payment received without changing order status', async () => {
    const { transitionOrder, markPaymentReceived } = await workflow();
    await transitionOrder('ORD-A', 'processing', 'SEL-A');
    const paid = await markPaymentReceived('ORD-A', 'SEL-A');
    expect(paid.status).toBe('processing');
    expect(paid.payment.status).toBe('paid');
  });

  it('prevents overselling and preserves all products on multi-item failure', async () => {
    const second = product({
      id: 'PROD-B',
      inventory: {
        ...product().inventory,
        sku: 'SKU-B',
        barcode: 'BAR-B',
        quantity: 2,
        availableQuantity: 2,
      },
    });
    const multi = order({
      items: [
        order().items[0],
        { ...order().items[0], productId: 'PROD-B', sku: 'SKU-B', quantity: 5 },
      ],
    });
    seed([product(), second], [multi]);
    const { confirmPayment, transitionOrder } = await workflow();
    await confirmPayment('ORD-A');
    await expect(transitionOrder('ORD-A', 'processing', 'SEL-A')).rejects.toMatchObject({
      status: 409,
    });
    expect(savedProducts().map((item) => item.inventory.availableQuantity)).toEqual([25, 2]);
    expect(JSON.parse(files.get(activitiesPath) ?? '{}').activities).toHaveLength(0);
  });

  it('aggregates duplicate product lines before checking stock', async () => {
    const duplicate = order({
      items: [
        { ...order().items[0], quantity: 3 },
        { ...order().items[0], quantity: 4 },
      ],
    });
    seed(
      [product({ inventory: { ...product().inventory, quantity: 6, availableQuantity: 6 } })],
      [duplicate],
    );
    const { confirmPayment, transitionOrder } = await workflow();
    await confirmPayment('ORD-A');
    await expect(transitionOrder('ORD-A', 'processing', 'SEL-A')).rejects.toMatchObject({
      status: 409,
    });
    expect(savedProducts()[0].inventory.availableQuantity).toBe(6);
  });

  it('releases reservations on cancellation and finalizes delivery once', async () => {
    const { confirmPayment, transitionOrder } = await workflow();
    await confirmPayment('ORD-A');
    await transitionOrder('ORD-A', 'processing', 'SEL-A');
    await transitionOrder('ORD-A', 'ready_to_deliver', 'SEL-A');
    await transitionOrder('ORD-A', 'out_for_delivery', 'SEL-A');
    await transitionOrder('ORD-A', 'delivered', 'SEL-A');
    expect(savedProducts()[0].inventory).toMatchObject({
      quantity: 22,
      reservedQuantity: 0,
      availableQuantity: 22,
    });
    expect(savedProducts()[0].soldCount).toBe(3);
    expect(JSON.parse(files.get(activitiesPath) ?? '{}').activities[0].type).toBe('finalized');
    await expect(transitionOrder('ORD-A', 'delivered', 'SEL-A')).rejects.toMatchObject({
      status: 409,
    });
  });

  it('rejects invalid transitions and missing orders', async () => {
    const { confirmPayment, transitionOrder } = await workflow();
    await expect(confirmPayment('MISSING')).rejects.toMatchObject({ status: 404 });
    await expect(transitionOrder('ORD-A', 'delivered', 'SEL-A')).rejects.toMatchObject({
      status: 409,
    });
    await confirmPayment('ORD-A');
    await transitionOrder('ORD-A', 'cancelled', 'SEL-A');
    await expect(transitionOrder('ORD-A', 'processing', 'SEL-A')).rejects.toMatchObject({
      status: 409,
    });
  });
});
