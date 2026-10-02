import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

const prefix = 'socio-commerce/runtime/';
const objects = new Map<string, string>();

for (const name of [
  'carts',
  'categories',
  'inventory-activities',
  'notifications',
  'order-statuses',
  'orders',
  'payments',
  'platform-settings',
  'products',
  'promotion-rules',
  'refunds',
  'reviews',
  'roles',
  'seller-activities',
  'sellers',
  'social-shares',
  'subcategories',
  'user-metrics',
  'users',
  'vendors',
]) {
  objects.set(`${prefix}${name}.json`, readFileSync(resolve('src/data', `${name}.json`), 'utf8'));
}

const response = (value: string | undefined) =>
  value === undefined
    ? null
    : {
        stream: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(value));
            controller.close();
          },
        }),
      };

const initialObjects = new Map(objects);
(globalThis as typeof globalThis & { __resetTestBlobStorage?: () => void }).__resetTestBlobStorage =
  () => {
    objects.clear();
    for (const [key, value] of initialObjects) objects.set(key, value);
  };

vi.stubEnv('BLOB_STORE_ID', 'test-store');
vi.mock('@vercel/blob', () => ({
  get: vi.fn(async (pathname: string) => response(objects.get(pathname))),
  put: vi.fn(async (pathname: string, value: string) => {
    objects.set(pathname, value);
    return { pathname };
  }),
}));
