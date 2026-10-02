import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const files = new Map<string, string>();

vi.mock('fs', () => {
  const readFile = vi.fn(async (file: string) => {
    const value = files.get(file);
    if (value === undefined) throw new Error(`Missing test fixture: ${file}`);
    return value;
  });
  const writeFile = vi.fn(async (file: string, value: string) => {
    files.set(file, value);
  });
  return { promises: { readFile, writeFile } };
});

const dataPath = (name: string) => `${process.cwd()}/src/data/${name}`;
const sellersPath = dataPath('sellers.json');
const usersPath = dataPath('users.json');
const productsPath = dataPath('products.json');
const activitiesPath = dataPath('inventory-activities.json');

const sellers = {
  sellers: [
    { id: 'SEL-A', userId: 'USR-A', vendorId: 'VEN-A', role: 'seller', status: 'active' },
    { id: 'SUPER-A', userId: 'USR-SA', vendorId: 'VEN-A', role: 'super_seller', status: 'active' },
    { id: 'SEL-B', userId: 'USR-B', vendorId: 'VEN-B', role: 'seller', status: 'active' },
    { id: 'SUPER-B', userId: 'USR-SB', vendorId: 'VEN-B', role: 'super_seller', status: 'active' },
    { id: 'SEL-INACTIVE', userId: 'USR-I', vendorId: 'VEN-A', role: 'seller', status: 'inactive' },
  ],
};

const users = { users: ['USR-A', 'USR-SA', 'USR-B', 'USR-SB', 'USR-I'].map((id) => ({ id })) };

function makeProduct(id: string, vendorId: string, sellerId: string) {
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
    description: 'Test product',
    shortDescription: 'Test',
    images: [],
    video: null,
    pricing: { regularPrice: 100, salePrice: 100, currency: 'NPR', discountPercentage: 0 },
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

function seed() {
  files.clear();
  files.set(sellersPath, JSON.stringify(sellers));
  files.set(usersPath, JSON.stringify(users));
  files.set(
    productsPath,
    JSON.stringify({
      products: [makeProduct('PROD-A', 'VEN-A', 'SEL-A'), makeProduct('PROD-B', 'VEN-B', 'SEL-B')],
    }),
  );
  files.set(activitiesPath, JSON.stringify({ activities: [] }));
}

function request(method: string, path: string, sellerId?: string, body?: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: sellerId
      ? {
          'x-seller-id': sellerId,
          cookie: `socio-seller-session=${sellerId}`,
          'content-type': 'application/json',
        }
      : undefined,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('seller API authorization boundaries', () => {
  beforeEach(seed);

  it('requires authentication and scopes product listing by seller/vendor', async () => {
    const { GET } = await import('@/app/api/seller/products/route');
    expect((await GET(request('GET', '/api/seller/products'))).status).toBe(401);
    const own = await GET(request('GET', '/api/seller/products', 'SEL-A'));
    expect(own.status).toBe(200);
    expect((await own.json()).products.map((product: { id: string }) => product.id)).toEqual([
      'PROD-A',
    ]);
    const vendor = await GET(request('GET', '/api/seller/products', 'SUPER-A'));
    expect((await vendor.json()).products.map((product: { id: string }) => product.id)).toEqual([
      'PROD-A',
    ]);
  });

  it('prevents cross-vendor inventory changes and records valid adjustments', async () => {
    const { POST } = await import('@/app/api/seller/inventory/[productId]/adjust/route');
    expect(
      (
        await POST(request('POST', '/api/seller/inventory/PROD-A/adjust'), {
          params: Promise.resolve({ productId: 'PROD-A' }),
        })
      ).status,
    ).toBe(401);
    const denied = await POST(
      request('POST', '/api/seller/inventory/PROD-B/adjust', 'SEL-A', {
        type: 'increase',
        quantity: 5,
        reason: 'test',
      }),
      { params: Promise.resolve({ productId: 'PROD-B' }) },
    );
    expect(denied.status).toBe(403);
    const allowed = await POST(
      request('POST', '/api/seller/inventory/PROD-A/adjust', 'SEL-A', {
        type: 'increase',
        quantity: 5,
        reason: 'test',
      }),
      { params: Promise.resolve({ productId: 'PROD-A' }) },
    );
    expect(allowed.status).toBe(200);
    const product = JSON.parse(files.get(productsPath) ?? '{}').products[0];
    expect(product.inventory).toMatchObject({
      quantity: 15,
      availableQuantity: 15,
      reservedQuantity: 0,
    });
    expect(JSON.parse(files.get(activitiesPath) ?? '{}').activities).toHaveLength(1);
  });

  it('rejects inactive sellers and invalid inventory quantities', async () => {
    const { GET } = await import('@/app/api/seller/products/route');
    expect((await GET(request('GET', '/api/seller/products', 'SEL-INACTIVE'))).status).toBe(401);
    const { POST } = await import('@/app/api/seller/inventory/[productId]/adjust/route');
    for (const quantity of [0, -1, 1.5, '5', null]) {
      const response = await POST(
        request('POST', '/api/seller/inventory/PROD-A/adjust', 'SEL-A', {
          type: 'increase',
          quantity,
          reason: 'test',
        }),
        { params: Promise.resolve({ productId: 'PROD-A' }) },
      );
      expect(response.status).toBe(400);
    }
  });

  it('derives product ownership from the authenticated seller', async () => {
    const { POST } = await import('@/app/api/seller/products/route');
    const response = await POST(
      request('POST', '/api/seller/products', 'SEL-A', {
        sellerId: 'SEL-B',
        vendorId: 'VEN-B',
        name: 'Owned product',
        categoryId: 'CAT',
        description: 'Test product',
        pricing: { regularPrice: 20, salePrice: 20 },
        inventory: { sku: 'UNIQUE', quantity: 2, lowStockThreshold: 1 },
      }),
    );
    expect(response.status).toBe(201);
    const created = JSON.parse(files.get(productsPath) ?? '{}').products.at(-1);
    expect(created).toMatchObject({ sellerId: 'SEL-A', vendorId: 'VEN-A', status: 'pending' });
  });
});
