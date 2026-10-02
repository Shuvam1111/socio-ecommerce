export type ProductStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'inactive';

export interface ProductPricing {
  regularPrice: number;
  salePrice: number;
  currency: string;
  discountPercentage: number;
}

export interface ProductInventory {
  sku: string;
  barcode: string;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
}

export interface ProductAttributes {
  [key: string]: string;
}

export interface ProductShipping {
  freeShipping: boolean;
  shippingFee: number;
  estimatedDeliveryDays: string;
}

export interface ProductReturnPolicy {
  returnable: boolean;
  returnDays: number;
}

export interface ProductCommission {
  influencerPercentage: number;
  affiliatePercentage: number;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface SellerProduct {
  id: string;
  vendorId: string;
  sellerId: string;

  categoryId: string;
  subcategoryId: string | null;

  name: string;
  slug: string;
  brand: string;
  model: string;

  description: string;
  shortDescription: string;

  images: string[];
  video: string | null;

  pricing: ProductPricing;

  inventory: ProductInventory;

  variants: ProductVariant[];

  attributes: ProductAttributes;

  shipping: ProductShipping;

  returnPolicy: ProductReturnPolicy;

  commission: ProductCommission;

  rating: ProductRating;

  soldCount: number;
  viewCount: number;

  status: ProductStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSellerProductInput {
  categoryId: string;
  subcategoryId?: string | null;

  name: string;
  slug: string;
  brand: string;
  model: string;

  description: string;
  shortDescription: string;

  images?: string[];
  video?: string | null;

  pricing: ProductPricing;

  inventory: ProductInventory;

  variants?: ProductVariant[];

  attributes?: ProductAttributes;

  shipping: ProductShipping;

  returnPolicy: ProductReturnPolicy;

  commission?: ProductCommission;
}
