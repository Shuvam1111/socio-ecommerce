import { beforeEach, describe, expect, it } from 'vitest';
import { createTestBlobDatasetMap } from './blob-storage-setup';
import { NextRequest } from 'next/server';

const files = createTestBlobDatasetMap();

const dataPath = (name: string) => `${process.cwd()}/src/data/${name}`;
const sellersPath = dataPath('sellers.json');
const usersPath = dataPath('users.json');
const productsPath = dataPath('products.json');
const ordersPath = dataPath('orders.json');
const activitiesPath = dataPath('inventory-activities.json');

const permissions = ['manage_products', 'manage_inventory', 'process_orders', 'view_sales'];
const sellers = {
  sellers: [
    {
      id: 'SEL-A',
      userId: 'USR-A',
      vendorId: 'VEN-A',
      role: 'seller',
      status: 'active',
      permissions,
    },
    {
      id: 'SUPER-A',
      userId: 'USR-SA',
      vendorId: 'VEN-A',
      role: 'super_seller',
      status: 'active',
      permissions: [...permissions, 'add_sellers', 'remove_sellers'],
    },
    {
      id: 'SEL-B',
      userId: 'USR-B',
      vendorId: 'VEN-B',
      role: 'seller',
      status: 'active',
      permissions,
    },
    {
      id: 'SUPER-B',
      userId: 'USR-SB',
      vendorId: 'VEN-B',
      role: 'super_seller',
      status: 'active',
      permissions: [...permissions, 'add_sellers', 'remove_sellers'],
    },
    {
      id: 'SEL-INACTIVE',
      userId: 'USR-I',
      vendorId: 'VEN-A',
      role: 'seller',
      status: 'inactive',
      permissions,
    },
  ],
};
const users = {
  users: ['USR-A', 'USR-SA', 'USR-B', 'USR-SB', 'USR-I'].map((id) => ({
    id,
    username: id,
    email: `${id}@test.local`,
    password: 'password',
  })),
};

function product(id: string, vendorId: string, sellerId: string) {
  return {
    id,
    vendorId,
    sellerId,
    categoryId: 'CAT',
    subcategoryId: null,
    name: id,
    slug: id.toLowerCase(),
    brand: 'Test',
    model: '1',
    description: 'Description',
    shortDescription: 'Short',
    images: [],
    video: null,
    pricing: { regularPrice: 100, salePrice: 90, currency: 'NPR', discountPercentage: 10 },
    inventory: {
      sku: `SKU-${id}`,
      barcode: `BAR-${id}`,
      quantity: 10,
      availableQuantity: 10,
      reservedQuantity: 0,
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
  };
}

function order(
  id: string,
  vendorId: string,
  sellerId: string,
  status = 'pending_payment',
  paymentStatus = 'pending',
) {
  return {
    id,
    orderNumber: id,
    sellerId,
    vendorId,
    buyerId: 'GUEST-CART-A',
    status,
    payment: { status: paymentStatus, transactionId: null, paidAt: null },
    items: [
      {
        productId: vendorId === 'VEN-A' ? 'PROD-A' : 'PROD-B',
        quantity: 3,
        unitPrice: 100,
        total: 300,
      },
    ],
    total: 300,
    timeline: [{ status, changedBy: 'test', timestamp: '2026-01-01T00:00:00.000Z' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function seed() {
  files.clear();
  files.set(sellersPath, JSON.stringify(sellers));
  files.set(usersPath, JSON.stringify(users));
  files.set(
    productsPath,
    JSON.stringify({
      products: [product('PROD-A', 'VEN-A', 'SEL-A'), product('PROD-B', 'VEN-B', 'SEL-B')],
    }),
  );
  files.set(
    ordersPath,
    JSON.stringify({
      orders: [order('ORD-A', 'VEN-A', 'SEL-A'), order('ORD-B', 'VEN-B', 'SEL-B')],
    }),
  );
  files.set(activitiesPath, JSON.stringify({ activities: [] }));
  files.set('categories.json', JSON.stringify({ categories: [{ id: 'CAT', name: 'Test', slug: 'test', status: 'active' }] }));
  files.set('subcategories.json', JSON.stringify({ subcategories: [] }));
}

function request(method: string, path: string, sellerId?: string, body?: unknown, cookie = false) {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cookie && !sellerId) headers.cookie = 'socio-cart-id=CART-A';
  if (sellerId)
    headers[cookie ? 'cookie' : 'x-seller-id'] = cookie
      ? `socio-seller-session=${sellerId}`
      : sellerId;
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('complete API security coverage', () => {
  beforeEach(async () => {
    const { resetLocalRuntimeData } = await import('@/features/storage/services/json-storage-service');
    resetLocalRuntimeData();
    seed();
  });

  it('tests product detail, update, delete, ownership, and inventory protection', async () => {
    const route = await import('@/app/api/seller/products/[id]/route');
    expect(
      (await route.GET(request('GET', '/api/seller/products/PROD-A'), params('PROD-A'))).status,
    ).toBe(401);
    expect(
      (await route.GET(request('GET', '/api/seller/products/PROD-A', 'SEL-A'), params('PROD-A')))
        .status,
    ).toBe(200);
    expect(
      (await route.GET(request('GET', '/api/seller/products/PROD-B', 'SEL-A'), params('PROD-B')))
        .status,
    ).toBe(403);
    expect(
      (await route.GET(request('GET', '/api/seller/products/MISSING', 'SEL-A'), params('MISSING')))
        .status,
    ).toBe(404);
    expect(
      (
        await route.PUT(
          request('PUT', '/api/seller/products/PROD-A', 'SEL-A', { name: 'Updated' }),
          params('PROD-A'),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await route.PUT(
          request('PUT', '/api/seller/products/PROD-B', 'SEL-A', { name: 'Nope' }),
          params('PROD-B'),
        )
      ).status,
    ).toBe(403);
    for (const field of ['quantity', 'availableQuantity', 'reservedQuantity']) {
      expect(
        (
          await route.PUT(
            request('PUT', '/api/seller/products/PROD-A', 'SEL-A', { inventory: { [field]: 99 } }),
            params('PROD-A'),
          )
        ).status,
      ).toBe(400);
    }
    expect(
      (
        await route.DELETE(
          request('DELETE', '/api/seller/products/PROD-B', 'SEL-A'),
          params('PROD-B'),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await route.DELETE(
          request('DELETE', '/api/seller/products/PROD-A', 'SEL-A'),
          params('PROD-A'),
        )
      ).status,
    ).toBe(200);
  });

  it('scopes order listing and detail to seller/vendor ownership', async () => {
    const list = await import('@/app/api/seller/orders/route');
    const detail = await import('@/app/api/seller/orders/[id]/route');
    expect((await list.GET(request('GET', '/api/seller/orders'))).status).toBe(401);
    const ownList = await list.GET(request('GET', '/api/seller/orders', 'SEL-A'));
    expect(await ownList.json()).toMatchObject({ orders: [{ id: 'ORD-A' }] });
    const vendorList = await list.GET(request('GET', '/api/seller/orders', 'SUPER-A'));
    expect(await vendorList.json()).toMatchObject({ orders: [{ id: 'ORD-A' }] });
    expect(
      (await detail.GET(request('GET', '/api/seller/orders/ORD-A', 'SEL-A'), params('ORD-A')))
        .status,
    ).toBe(200);
    expect(
      (await detail.GET(request('GET', '/api/seller/orders/ORD-B', 'SEL-A'), params('ORD-B')))
        .status,
    ).toBe(403);
    expect(
      (await detail.GET(request('GET', '/api/seller/orders/MISSING', 'SEL-A'), params('MISSING')))
        .status,
    ).toBe(404);
  });

  it('tests payment confirmation route and ignores client state manipulation', async () => {
    const route = await import('@/app/api/orders/[id]/payment/confirm/route');
    expect(
      (
        await route.POST(
          request(
            'POST',
            '/api/orders/ORD-A/payment/confirm',
            undefined,
            {
              paymentStatus: 'paid',
              orderStatus: 'paid',
              vendorId: 'VEN-B',
            },
            true,
          ),
          params('ORD-A'),
        )
      ).status,
    ).toBe(200);
    const saved = JSON.parse(files.get(ordersPath)!);
    expect(saved.orders[0]).toMatchObject({ status: 'paid', payment: { status: 'paid' } });
    expect(JSON.parse(files.get(productsPath)!).products[0].inventory).toMatchObject({
      quantity: 10,
      reservedQuantity: 0,
      availableQuantity: 10,
    });
    expect(
      (
        await route.POST(
          request('POST', '/api/orders/ORD-A/payment/confirm', undefined, undefined, true),
          params('ORD-A'),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await route.POST(
          request('POST', '/api/orders/MISSING/payment/confirm', undefined, undefined, true),
          params('MISSING'),
        )
      ).status,
    ).toBe(404);
  });

  it('tests verification, transition authorization, payment requirement, and reservation', async () => {
    const verify = await import('@/app/api/seller/orders/[id]/verify/route');
    const transition = await import('@/app/api/seller/orders/[id]/route');
    const data = JSON.parse(files.get(ordersPath)!);
    data.orders[0].status = 'paid';
    data.orders[0].payment.status = 'paid';
    files.set(ordersPath, JSON.stringify(data));
    expect(
      (
        await verify.POST(
          request('POST', '/api/seller/orders/ORD-A/verify', 'SEL-B'),
          params('ORD-A'),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await verify.POST(
          request('POST', '/api/seller/orders/ORD-A/verify', 'SEL-A'),
          params('ORD-A'),
        )
      ).status,
    ).toBe(200);
    expect(JSON.parse(files.get(productsPath)!).products[0].inventory).toMatchObject({
      reservedQuantity: 3,
      availableQuantity: 7,
    });
    expect(
      (
        await verify.POST(
          request('POST', '/api/seller/orders/ORD-A/verify', 'SEL-A'),
          params('ORD-A'),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await transition.POST(
          request('POST', '/api/seller/orders/ORD-A', 'SEL-A', { status: 'delivered' }),
          params('ORD-A'),
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await transition.POST(
          request('POST', '/api/seller/orders/ORD-A', 'SEL-A', { status: 'ready_to_deliver' }),
          params('ORD-A'),
        )
      ).status,
    ).toBe(200);
  });

  it('tests seller management roles, cookie sessions, and vendor isolation', async () => {
    const route = await import('@/app/api/seller/sellers/route');
    expect(
      (await route.GET(request('GET', '/api/seller/sellers', 'SEL-A', undefined, true))).status,
    ).toBe(403);
    expect(
      (await route.GET(request('GET', '/api/seller/sellers', 'SUPER-A', undefined, true))).status,
    ).toBe(200);
    expect(
      (await route.GET(request('GET', '/api/seller/sellers', 'SEL-INACTIVE', undefined, true)))
        .status,
    ).toBe(401);
    const created = await route.POST(
      request(
        'POST',
        '/api/seller/sellers',
        'SUPER-A',
        { username: 'new', email: 'new@test.local', password: 'password', vendorId: 'VEN-B' },
        true,
      ),
    );
    expect(created.status).toBe(201);
    expect((await created.json()).seller).toMatchObject({ vendorId: 'VEN-A' });
    expect(
      (
        await route.PATCH(
          request(
            'PATCH',
            '/api/seller/sellers',
            'SUPER-A',
            { id: 'SEL-B', status: 'inactive' },
            true,
          ),
        )
      ).status,
    ).toBe(404);
  });
});
