import type { CreateSellerProductInput, SellerProduct } from '../types/product';

interface StoredSellerSession {
  sellerId?: string;
}

function getSellerId(): string {
  const storedSeller = localStorage.getItem('socio-seller');

  if (!storedSeller) {
    throw new Error('Seller session not found.');
  }

  try {
    const seller = JSON.parse(storedSeller) as StoredSellerSession;

    if (!seller.sellerId) {
      throw new Error('Seller ID is missing.');
    }

    return seller.sellerId;
  } catch {
    throw new Error('Invalid seller session.');
  }
}

async function sellerRequest(url: string, options: RequestInit = {}) {
  const sellerId = getSellerId();

  const response = await fetch(url, {
    ...options,
    headers: {
      'x-seller-id': sellerId,
      ...options.headers,
    },
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to complete request.');
  }

  return result;
}

export async function getSellerProducts(): Promise<SellerProduct[]> {
  const result = await sellerRequest('/api/seller/products');

  return result.products as SellerProduct[];
}

export async function getSellerProduct(productId: string): Promise<SellerProduct> {
  const result = await sellerRequest(`/api/seller/products/${productId}`);

  return result.product as SellerProduct;
}

/**
 * Create a new product.
 *
 * Important:
 * CreateSellerProductInput intentionally does NOT contain:
 * - id
 * - vendorId
 * - sellerId
 * - status
 * - rating
 * - soldCount
 * - viewCount
 * - createdAt
 * - updatedAt
 *
 * Those values are controlled by the server.
 */
export async function createSellerProduct(product: CreateSellerProductInput) {
  return sellerRequest('/api/seller/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
}

/**
 * Update an existing product.
 *
 * Partial<SellerProduct> is used because the API itself
 * protects fields such as id, vendorId, sellerId,
 * rating, soldCount and viewCount.
 */
export async function updateSellerProduct(productId: string, product: Partial<SellerProduct>) {
  return sellerRequest(`/api/seller/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
}

export async function deleteSellerProduct(productId: string) {
  return sellerRequest(`/api/seller/products/${productId}`, {
    method: 'DELETE',
  });
}
