import { readJson } from '@/features/storage/services/json-storage-service';

import type { SellerProduct } from '@/features/sellers/types/product';
import { loadCategories, loadSubcategories } from '@/features/catalog/services/taxonomy-service';

interface ProductsData {
  products: SellerProduct[];
}

export interface MarketplaceQuery {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'sold';
  page: number;
  limit: number;
}

export interface MarketplaceProduct extends SellerProduct {
  categoryName: string;
  subcategoryName: string | null;
}

export type MarketplaceDetailProduct = Omit<
  SellerProduct,
  'vendorId' | 'sellerId' | 'commission' | 'viewCount'
> & {
  categoryName: string;
  subcategoryName: string | null;
};

export async function loadMarketplaceProducts(): Promise<SellerProduct[]> {
  const data = await readJson<ProductsData>('products.json', { products: [] });

  return data.products.filter((product) => product.status === 'approved');
}

export async function getMarketplaceProductBySlug(slug: string) {
  const products = await loadMarketplaceProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function queryMarketplaceProducts(query: MarketplaceQuery) {
  const [products, categories, subcategories] = await Promise.all([
    loadMarketplaceProducts(),
    loadCategories(),
    loadSubcategories(),
  ]);
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const subcategoryMap = new Map(subcategories.map((subcategory) => [subcategory.id, subcategory]));
  const search = query.search?.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const category = categoryMap.get(product.categoryId);
    const subcategory = product.subcategoryId ? subcategoryMap.get(product.subcategoryId) : null;
    if (category?.status !== 'active' || (subcategory && subcategory.status !== 'active'))
      return false;
    if (query.categoryId && product.categoryId !== query.categoryId) return false;
    if (query.subcategoryId && product.subcategoryId !== query.subcategoryId) return false;
    const price = product.pricing.salePrice || product.pricing.regularPrice;
    if (query.minPrice !== undefined && price < query.minPrice) return false;
    if (query.maxPrice !== undefined && price > query.maxPrice) return false;
    if (search) {
      const haystack = [
        product.name,
        product.brand,
        product.model,
        product.description,
        product.shortDescription,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
  if (query.sort === 'newest') filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (query.sort === 'price-asc')
    filtered.sort((a, b) => a.pricing.salePrice - b.pricing.salePrice);
  if (query.sort === 'price-desc')
    filtered.sort((a, b) => b.pricing.salePrice - a.pricing.salePrice);
  if (query.sort === 'rating') filtered.sort((a, b) => b.rating.average - a.rating.average);
  if (query.sort === 'sold') filtered.sort((a, b) => b.soldCount - a.soldCount);
  const total = filtered.length;
  const start = (query.page - 1) * query.limit;
  const pageItems = filtered
    .slice(start, start + query.limit)
    .map((product) =>
      toMarketplaceProduct(
        product,
        categoryMap.get(product.categoryId)?.name ?? 'Category',
        product.subcategoryId ? (subcategoryMap.get(product.subcategoryId)?.name ?? null) : null,
      ),
    );
  return {
    products: pageItems,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export function toMarketplaceProduct(
  product: SellerProduct,
  categoryName: string,
  subcategoryName: string | null,
): MarketplaceDetailProduct {
  const safeProduct = JSON.parse(JSON.stringify(product)) as MarketplaceDetailProduct;
  delete (safeProduct as Partial<SellerProduct>).vendorId;
  delete (safeProduct as Partial<SellerProduct>).sellerId;
  delete (safeProduct as Partial<SellerProduct>).commission;
  delete (safeProduct as Partial<SellerProduct>).viewCount;
  return { ...safeProduct, categoryName, subcategoryName };
}

export function getCurrentPrice(product: SellerProduct, variantId?: string | null) {
  const variant = variantId ? product.variants.find((item) => item.id === variantId) : null;
  return variant?.price ?? product.pricing.salePrice;
}

export function getAvailableQuantity(product: SellerProduct, variantId?: string | null) {
  const variant = variantId ? product.variants.find((item) => item.id === variantId) : null;
  return variant ? Math.max(variant.quantity, 0) : Math.max(product.inventory.availableQuantity, 0);
}
