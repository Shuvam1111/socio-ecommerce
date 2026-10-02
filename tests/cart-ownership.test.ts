import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestBlobDatasetMap } from './blob-storage-setup';

const files = createTestBlobDatasetMap();
const carts = {
  get carts() {
    return JSON.parse(files.get('carts.json') ?? '{"carts":[]}').carts;
  },
};

vi.mock('@/features/marketplace/services/marketplace-service', () => ({
  loadMarketplaceProducts: vi.fn(async () => [
    {
      id: 'PROD-1',
      name: 'Test product',
      slug: 'test-product',
      images: [],
      pricing: { regularPrice: 10, salePrice: null, currency: 'NPR' },
      inventory: { quantity: 10, availableQuantity: 10, reservedQuantity: 0 },
      variants: [],
    },
  ]),
  getAvailableQuantity: vi.fn(() => 10),
  getCurrentPrice: vi.fn(() => 10),
}));

import { CartAccessError, getCart, mutateCart } from '@/features/marketplace/services/cart-service';

describe('cart ownership', () => {
  beforeEach(() => {
    files.clear();
    files.set('carts.json', JSON.stringify({ carts: [] }));
  });

  it('keeps guest carts accessible without an owner', async () => {
    const cart = await mutateCart('guest-cart', {
      action: 'add',
      productId: 'PROD-1',
      quantity: 1,
    });

    expect(cart.items).toHaveLength(1);
    expect(carts.carts[0]).not.toHaveProperty('ownerId');
  });

  it('binds an authenticated cart and blocks another buyer from reading it', async () => {
    await mutateCart('buyer-cart', {
      ownerId: 'USR-A',
      action: 'add',
      productId: 'PROD-1',
      quantity: 1,
    });

    await expect(getCart('buyer-cart', 'USR-B')).rejects.toBeInstanceOf(CartAccessError);
    await expect(
      mutateCart('buyer-cart', {
        ownerId: 'USR-B',
        action: 'add',
        productId: 'PROD-1',
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(CartAccessError);
  });

  it('does not let a client-supplied identity override the owner', async () => {
    await mutateCart('buyer-cart', {
      ownerId: 'USR-A',
      action: 'add',
      productId: 'PROD-1',
      quantity: 1,
    });

    await expect(getCart('buyer-cart', 'USR-B')).rejects.toThrow('Cart not found.');
    expect((await getCart('buyer-cart', 'USR-A')).items[0].quantity).toBe(1);
  });
});
