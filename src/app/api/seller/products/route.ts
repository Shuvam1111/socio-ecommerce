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
  userId: string;
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

export async function GET(request: NextRequest) {
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

    const file = await fs.readFile(getProductsPath(), 'utf-8');

    const data = JSON.parse(file) as ProductsData;

    const products = data.products.filter((product) => {
      if (seller.role === 'super_seller') {
        return product.vendorId === seller.vendorId;
      }

      return product.vendorId === seller.vendorId && product.sellerId === seller.id;
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error('Failed to load seller products:', error);

    return NextResponse.json(
      {
        message: 'Unable to load products.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    if (!body.name || !body.categoryId || !body.description || !body.pricing || !body.inventory) {
      return NextResponse.json(
        {
          message: 'Name, category, description, pricing and inventory are required.',
        },
        { status: 400 },
      );
    }

    try {
      const taxonomy = validateProductTaxonomy(
        body.categoryId,
        body.subcategoryId,
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

    const productsPath = getProductsPath();

    const file = await fs.readFile(productsPath, 'utf-8');

    const data = JSON.parse(file) as ProductsData;

    const skuExists = data.products.some((product) => product.inventory.sku === body.inventory.sku);

    if (skuExists) {
      return NextResponse.json(
        {
          message: 'A product with this SKU already exists.',
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const productNumber = data.products.length + 1;

    const images = (
      Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ['/images/product-placeholder.svg']
    ).map((image: unknown) => (typeof image === 'string' ? image.trim() : ''));
    const imagePattern = /^(https?:\/\/|\/images\/)/;

    if (
      images.length < 1 ||
      images.length > 9 ||
      images.some((image: string) => !image || !imagePattern.test(image)) ||
      new Set(images).size !== images.length
    ) {
      return NextResponse.json(
        { message: 'A unique primary image and up to 8 unique secondary images are required.' },
        { status: 400 },
      );
    }

    const quantity = Number(body.inventory.quantity ?? 0);
    const regularPrice = Number(body.pricing.regularPrice);
    const salePrice = Number(body.pricing.salePrice);
    const lowStockThreshold = Number(body.inventory.lowStockThreshold ?? 5);

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isFinite(regularPrice) ||
      regularPrice <= 0 ||
      !Number.isFinite(salePrice) ||
      salePrice < 0 ||
      salePrice > regularPrice ||
      !Number.isInteger(lowStockThreshold) ||
      lowStockThreshold < 0 ||
      typeof body.inventory.sku !== 'string' ||
      !body.inventory.sku.trim()
    ) {
      return NextResponse.json(
        { message: 'Invalid pricing, inventory, or SKU values.' },
        { status: 400 },
      );
    }

    const product: Product = {
      id: `PROD-${String(productNumber).padStart(6, '0')}`,

      vendorId: seller.vendorId,
      sellerId: seller.id,

      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId ?? null,

      name: body.name,
      slug: body.slug ?? body.name.toLowerCase().trim().replace(/\s+/g, '-'),

      brand: body.brand ?? '',
      model: body.model ?? '',

      description: body.description,
      shortDescription: body.shortDescription ?? '',

      images,

      video: body.video ?? null,

      pricing: {
        regularPrice,
        salePrice,
        currency: body.pricing.currency ?? 'NPR',
        discountPercentage: Number(body.pricing.discountPercentage ?? 0),
      },

      inventory: {
        sku: body.inventory.sku,
        barcode: body.inventory.barcode ?? '',
        quantity,
        availableQuantity: quantity,
        reservedQuantity: 0,
        lowStockThreshold,
      },

      variants: Array.isArray(body.variants) ? body.variants : [],

      attributes: body.attributes ?? {},

      shipping: {
        freeShipping: body.shipping?.freeShipping ?? false,
        shippingFee: Number(body.shipping?.shippingFee ?? 0),
        estimatedDeliveryDays: body.shipping?.estimatedDeliveryDays ?? '2-5',
      },

      returnPolicy: {
        returnable: body.returnPolicy?.returnable ?? true,
        returnDays: Number(body.returnPolicy?.returnDays ?? 7),
      },

      commission: {
        influencerPercentage: Number(body.commission?.influencerPercentage ?? 5),
        affiliatePercentage: Number(body.commission?.affiliatePercentage ?? 3),
      },

      rating: {
        average: 0,
        count: 0,
      },

      soldCount: 0,
      viewCount: 0,

      status: 'pending',

      createdAt: now,
      updatedAt: now,
    };

    data.products.push(product);

    await fs.writeFile(productsPath, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json(
      {
        message: 'Product created successfully.',
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create seller product:', error);

    return NextResponse.json(
      {
        message: 'Unable to create product.',
      },
      { status: 500 },
    );
  }
}
