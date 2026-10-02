import usersData from '@/data/users.json';
import vendorsData from '@/data/vendors.json';
import sellersData from '@/data/sellers.json';
import categoriesData from '@/data/categories.json';
import subcategoriesData from '@/data/subcategories.json';
import productsData from '@/data/products.json';
import reviewsData from '@/data/reviews.json';
import socialSharesData from '@/data/social-shares.json';
import promotionRulesData from '@/data/promotion-rules.json';
import userMetricsData from '@/data/user-metrics.json';

const STORAGE_KEYS = {
  users: 'socio-users',
  vendors: 'socio-vendors',
  sellers: 'socio-sellers',
  categories: 'socio-categories',
  subcategories: 'socio-subcategories',
  products: 'socio-products',
  reviews: 'socio-reviews',
  socialShares: 'socio-social-shares',
  promotionRules: 'socio-promotion-rules',
  userMetrics: 'socio-user-metrics',
} as const;

function initializeStorage(key: string, data: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }

  const existingData = localStorage.getItem(key);

  if (existingData !== null) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(data));
}

export function initializeMockData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  initializeStorage(STORAGE_KEYS.users, usersData);
  initializeStorage(STORAGE_KEYS.vendors, vendorsData);
  initializeStorage(STORAGE_KEYS.sellers, sellersData);
  initializeStorage(STORAGE_KEYS.categories, categoriesData);
  initializeStorage(STORAGE_KEYS.subcategories, subcategoriesData);
  initializeStorage(STORAGE_KEYS.products, productsData);
  initializeStorage(STORAGE_KEYS.reviews, reviewsData);
  initializeStorage(STORAGE_KEYS.socialShares, socialSharesData);
  initializeStorage(STORAGE_KEYS.promotionRules, promotionRulesData);
  initializeStorage(STORAGE_KEYS.userMetrics, userMetricsData);
}

export { STORAGE_KEYS };
