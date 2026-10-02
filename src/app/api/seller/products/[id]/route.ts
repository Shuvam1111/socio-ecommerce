import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  loadCategories,
  loadSubcategories,
  validateProductTaxonomy,
} from '@/features/catalog/services/taxonomy-service';

interface Seller {
  id: string;
  vendorId: string;
  role: 'super_seller' | 'seller';
  status: 'active' | 'inactive';
}

interface SellersData {
  sellers: Seller[];
}

interface Product {
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
  pricing: {
    regularPrice: number;
    salePrice: number;
    currency: string;
    discountPercentage: number;
  };
  inventory: {
    sku: string;
    barcode: string;
    quantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  };
  variants: {
    id: string;
    attributes: Record<string, string>;
    sku: string;
    barcode: string;
    price: number;
    quantity: number;
  }[];
  attributes: Record<string, string>;
  shipping: {
    freeShipping: boolean;
    shippingFee: number;
    estimatedDeliveryDays: string;
  };
  returnPolicy: {
    returnable: boolean;
    returnDays: number;
  };
  commission: {
    influencerPercentage: number;
    affiliatePercentage: number;
  };
  rating: {
    average: number;
    count: number;
  };
  soldCount: number;
  viewCount: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface ProductsData {
  products: Product[];
}

function getProductsPath() {
  return path.join(process.cwd(), 'src', 'data', 'products.json');
}

async function getSeller(sellerId: string) {
  const sellersPath = path.join(process.cwd(), 'src', 'data', 'sellers.json');

  const file = await fs.readFile(sellersPath, 'utf-8');

  const data = JSON.parse(file) as SellersData;

  return data.sellers.find((seller) => seller.id === sellerId && seller.status === 'active');
}

async function loadProducts() {
  const file = await fs.readFile(getProductsPath(), 'utf-8');

  return JSON.parse(file) as ProductsData;
}

function canAccessProduct(product: Product, seller: Seller) {
  return (
    product.vendorId === seller.vendorId &&
    (seller.role === 'super_seller' || product.sellerId === seller.id)
  );
}

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const sellerId = request.headers.get('x-seller-id');

    if (!sellerId) {
      return NextResponse.json(
        {
          message: 'Seller authentication is required.',
        },
        { status: 401 },
      );
    }

    const seller = await getSeller(sellerId);

    if (!seller) {
      return NextResponse.json(
        {
          message: 'Active seller account not found.',
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const data = await loadProducts();

    const product = data.products.find((item) => item.id === id);

    if (!product) {
      return NextResponse.json(
        {
          message: 'Product not found.',
        },
        { status: 404 },
      );
    }

    if (!canAccessProduct(product, seller)) {
      return NextResponse.json(
        {
          message: 'You do not have access to this product.',
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error('Failed to load seller product:', error);

    return NextResponse.json(
      {
        message: 'Unable to load product.',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const sellerId = request.headers.get('x-seller-id');

    if (!sellerId) {
      return NextResponse.json(
        {
          message: 'Seller authentication is required.',
        },
        { status: 401 },
      );
    }

    const seller = await getSeller(sellerId);

    if (!seller) {
      return NextResponse.json(
        {
          message: 'Active seller account not found.',
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const body = await request.json();
    const forbiddenInventoryFields = ['quantity', 'availableQuantity', 'reservedQuantity'];
    if (body.inventory && forbiddenInventoryFields.some((field) => field in body.inventory)) {
      return NextResponse.json(
        {
          message:
            'Inventory quantities must be changed through the inventory adjustment endpoint.',
        },
        { status: 400 },
      );
    }

    const data = await loadProducts();
    try {
      const taxonomy = validateProductTaxonomy(
        body.categoryId ?? data.products.find((item) => item.id === id)?.categoryId,
        body.subcategoryId ?? data.products.find((item) => item.id === id)?.subcategoryId,
        await loadCategories(),
        await loadSubcategories(),
      );
      if (!taxonomy.valid) return NextResponse.json({ message: taxonomy.message }, { status: 400 });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (
        !message.includes('Missing') &&
        !(error instanceof Error && 'code' in error && error.code === 'ENOENT')
      )
        throw error;
    }

    const productIndex = data.products.findIndex((item) => item.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        {
          message: 'Product not found.',
        },
        { status: 404 },
      );
    }

    const product = data.products[productIndex];

    if (!canAccessProduct(product, seller)) {
      return NextResponse.json(
        {
          message: 'You do not have access to this product.',
        },
        { status: 403 },
      );
    }

    if (body.inventory?.sku && body.inventory.sku !== product.inventory.sku) {
      const skuExists = data.products.some(
        (item) => item.id !== id && item.inventory.sku === body.inventory.sku,
      );

      if (skuExists) {
        return NextResponse.json(
          {
            message: 'A product with this SKU already exists.',
          },
          { status: 409 },
        );
      }
    }

    const updatedProduct: Product = {
      ...product,
      ...body,

      id: product.id,
      vendorId: product.vendorId,
      sellerId: product.sellerId,

      pricing: {
        ...product.pricing,
        ...(body.pricing ?? {}),
      },

      inventory: {
        ...product.inventory,
        ...(body.inventory ?? {}),
      },

      shipping: {
        ...product.shipping,
        ...(body.shipping ?? {}),
      },

      returnPolicy: {
        ...product.returnPolicy,
        ...(body.returnPolicy ?? {}),
      },

      commission: {
        ...product.commission,
        ...(body.commission ?? {}),
      },

      rating: product.rating,

      soldCount: product.soldCount,

      viewCount: product.viewCount,

      updatedAt: new Date().toISOString(),
    };

    data.products[productIndex] = updatedProduct;

    await fs.writeFile(getProductsPath(), JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Failed to update seller product:', error);

    return NextResponse.json(
      {
        message: 'Unable to update product.',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const sellerId = request.headers.get('x-seller-id');

    if (!sellerId) {
      return NextResponse.json(
        {
          message: 'Seller authentication is required.',
        },
        { status: 401 },
      );
    }

    const seller = await getSeller(sellerId);

    if (!seller) {
      return NextResponse.json(
        {
          message: 'Active seller account not found.',
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const data = await loadProducts();

    const product = data.products.find((item) => item.id === id);

    if (!product) {
      return NextResponse.json(
        {
          message: 'Product not found.',
        },
        { status: 404 },
      );
    }

    if (!canAccessProduct(product, seller)) {
      return NextResponse.json(
        {
          message: 'You do not have access to this product.',
        },
        { status: 403 },
      );
    }

    data.products = data.products.filter((item) => item.id !== id);

    await fs.writeFile(getProductsPath(), JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    console.error('Failed to delete seller product:', error);

    return NextResponse.json(
      {
        message: 'Unable to delete product.',
      },
      { status: 500 },
    );
  }
}
