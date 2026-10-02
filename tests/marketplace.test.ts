import { describe, expect, it } from 'vitest';
import {
  queryMarketplaceProducts,
  getMarketplaceProductBySlug,
  getAvailableQuantity,
  getCurrentPrice,
} from '@/features/marketplace/services/marketplace-service';
import { loadCategories, loadSubcategories } from '@/features/catalog/services/taxonomy-service';
import { validateCartQuantity } from '@/features/marketplace/services/cart-service';

describe('marketplace discovery', () => {
  it('exposes approved products with safe fields and pagination', async () => {
    const result = await queryMarketplaceProducts({ page: 1, limit: 1, sort: 'relevance' });
    expect(result.products).toHaveLength(1);
    expect(result.pagination.total).toBeGreaterThanOrEqual(1);
    expect(result.products[0]).not.toHaveProperty('vendorId');
    expect(result.products[0]).not.toHaveProperty('sellerId');
    expect(result.products[0]).not.toHaveProperty('commission');
  });

  it('searches and filters through the server service', async () => {
    const charger = await queryMarketplaceProducts({
      page: 1,
      limit: 20,
      search: 'charger',
      sort: 'relevance',
    });
    expect(
      charger.products.every((product) => product.name.toLowerCase().includes('charger')),
    ).toBe(true);
    const categories = await loadCategories();
    const subcategories = await loadSubcategories();
    const category = categories.find((item) => item.id === 'CAT-001');
    const subcategory = subcategories.find((item) => item.categoryId === category?.id);
    expect(category).toBeDefined();
    expect(subcategory).toBeDefined();
    const filtered = await queryMarketplaceProducts({
      page: 1,
      limit: 20,
      categoryId: category!.id,
      subcategoryId: subcategory!.id,
      sort: 'relevance',
    });
    expect(
      filtered.products.every(
        (product) =>
          product.categoryId === category!.id && product.subcategoryId === subcategory!.id,
      ),
    ).toBe(true);
  });

  it('supports price sorting and product visibility by slug', async () => {
    const result = await queryMarketplaceProducts({ page: 1, limit: 20, sort: 'price-asc' });
    expect(result.products[0].pricing.salePrice).toBeLessThanOrEqual(
      result.products.at(-1)!.pricing.salePrice,
    );
    expect(await getMarketplaceProductBySlug('example-smartphone-pro')).toBeTruthy();
    expect(await getMarketplaceProductBySlug('does-not-exist')).toBeNull();
  });

  it('rejects unsafe cart quantities', () => {
    expect(validateCartQuantity(1)).toBe(true);
    expect(validateCartQuantity(0)).toBe(false);
    expect(validateCartQuantity(-1)).toBe(false);
    expect(validateCartQuantity(1.5)).toBe(false);
    expect(validateCartQuantity('1')).toBe(false);
  });

  it('uses variant price and stock as authoritative values', async () => {
    const product = await getMarketplaceProductBySlug('example-smartphone-pro');
    expect(product).toBeTruthy();
    expect(getCurrentPrice(product!, 'VAR-003')).toBe(64999);
    expect(getAvailableQuantity(product!, 'VAR-003')).toBe(7);
  });
});
