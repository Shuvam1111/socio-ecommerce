import { NextRequest, NextResponse } from 'next/server';
import { readJson, updateJson } from '@/features/storage/services/json-storage-service';

import type { SellerProduct } from '@/features/sellers/types/product';
import type {
  InventoryActivity,
  InventoryAdjustmentInput,
} from '@/features/sellers/types/inventory';

interface SellerRecord {
  id: string;
  userId: string;
  vendorId: string;
  role: 'seller' | 'super_seller';
  status: 'active' | 'inactive';
}

interface SellersFile {
  sellers: SellerRecord[];
}

interface ProductsFile {
  products: SellerProduct[];
}

interface InventoryActivitiesFile {
  activities: InventoryActivity[];
}

async function getAuthenticatedSeller(request: NextRequest) {
  const sellerId = request.cookies.get('socio-seller-session')?.value;

  if (!sellerId) {
    return null;
  }

  const data = await readJson<SellersFile>('sellers.json', { sellers: [] });

  return (
    data.sellers.find((seller) => seller.id === sellerId && seller.status === 'active') ?? null
  );
}

function canManageProduct(seller: SellerRecord, product: SellerProduct) {
  if (seller.vendorId !== product.vendorId) {
    return false;
  }

  if (seller.role === 'super_seller') {
    return true;
  }

  return product.sellerId === seller.id;
}

function generateActivityId(activities: InventoryActivity[]) {
  const nextNumber = activities.length + 1;

  return `INVENTORY-${String(nextNumber).padStart(6, '0')}`;
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      productId: string;
    }>;
  },
) {
  try {
    const seller = await getAuthenticatedSeller(request);

    if (!seller) {
      return NextResponse.json(
        {
          message: 'Unauthorized seller.',
        },
        {
          status: 401,
        },
      );
    }

    const { productId } = await context.params;

    const body = (await request.json()) as Partial<InventoryAdjustmentInput>;

    const type = body.type;

    const quantity = typeof body.quantity === 'number' ? body.quantity : Number.NaN;

    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (type !== 'increase' && type !== 'decrease') {
      return NextResponse.json(
        {
          message: 'Invalid inventory adjustment type.',
        },
        {
          status: 400,
        },
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          message: 'Quantity must be a positive whole number.',
        },
        {
          status: 400,
        },
      );
    }

    if (!reason) {
      return NextResponse.json(
        {
          message: 'Adjustment reason is required.',
        },
        {
          status: 400,
        },
      );
    }

    const productsData = await readJson<ProductsFile>('products.json', { products: [] });

    const productIndex = productsData.products.findIndex((product) => product.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        {
          message: 'Product not found.',
        },
        {
          status: 404,
        },
      );
    }

    const product = productsData.products[productIndex];

    if (!canManageProduct(seller, product)) {
      return NextResponse.json(
        {
          message: 'You do not have permission to manage this product.',
        },
        {
          status: 403,
        },
      );
    }

    const inventory = product.inventory;

    const quantityBefore = inventory.quantity;

    const availableBefore = inventory.availableQuantity;

    let quantityAfter: number;
    let availableAfter: number;

    if (type === 'increase') {
      quantityAfter = quantityBefore + quantity;

      availableAfter = availableBefore + quantity;
    } else {
      if (quantity > inventory.availableQuantity) {
        return NextResponse.json(
          {
            message: 'Cannot decrease more stock than the available quantity.',
          },
          {
            status: 400,
          },
        );
      }

      quantityAfter = quantityBefore - quantity;

      availableAfter = availableBefore - quantity;
    }

    if (quantityAfter < inventory.reservedQuantity) {
      return NextResponse.json(
        {
          message: 'Total quantity cannot be lower than reserved quantity.',
        },
        {
          status: 400,
        },
      );
    }

    if (availableAfter < 0) {
      return NextResponse.json(
        {
          message: 'Available quantity cannot be negative.',
        },
        {
          status: 400,
        },
      );
    }

    const now = new Date().toISOString();

    productsData.products[productIndex] = {
      ...product,
      inventory: {
        ...inventory,

        quantity: quantityAfter,

        availableQuantity: availableAfter,
      },

      updatedAt: now,
    };

    await updateJson<ProductsFile>('products.json', { products: [] }, () => productsData);

    const activitiesData = await readJson<InventoryActivitiesFile>('inventory-activities.json', {
      activities: [],
    });

    const activity: InventoryActivity = {
      id: generateActivityId(activitiesData.activities),

      productId: product.id,

      vendorId: product.vendorId,

      sellerId: product.sellerId,

      productName: product.name,

      sku: product.inventory.sku,

      type,

      quantity,

      quantityBefore,

      quantityAfter,

      availableQuantityBefore: availableBefore,

      availableQuantityAfter: availableAfter,

      reason,

      createdAt: now,
    };

    activitiesData.activities.unshift(activity);

    await updateJson<InventoryActivitiesFile>(
      'inventory-activities.json',
      { activities: [] },
      () => activitiesData,
    );

    return NextResponse.json({
      message: 'Inventory updated successfully.',

      inventory: productsData.products[productIndex].inventory,

      activity,
    });
  } catch (error) {
    console.error('POST /api/seller/inventory/[productId]/adjust error:', error);

    return NextResponse.json(
      {
        message: 'Unable to update inventory.',
      },
      {
        status: 500,
      },
    );
  }
}
