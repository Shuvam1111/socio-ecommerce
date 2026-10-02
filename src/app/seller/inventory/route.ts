import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/features/storage/services/json-storage-service';

import type { SellerProduct } from '@/features/sellers/types/product';
import type { SellerInventoryItem, InventorySummary } from '@/features/sellers/types/inventory';

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

async function getAuthenticatedSeller(request: NextRequest) {
  const sellerId = request.headers.get('x-seller-id');

  if (!sellerId) {
    return null;
  }

  const data = await readJson<SellersFile>('sellers.json', { sellers: [] });

  return (
    data.sellers.find((seller) => seller.id === sellerId && seller.status === 'active') ?? null
  );
}

function getStockStatus(availableQuantity: number, lowStockThreshold: number) {
  if (availableQuantity <= 0) {
    return 'out_of_stock' as const;
  }

  if (availableQuantity <= lowStockThreshold) {
    return 'low_stock' as const;
  }

  return 'in_stock' as const;
}

export async function GET(request: NextRequest) {
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

    const productsData = await readJson<ProductsFile>('products.json', { products: [] });

    const products =
      seller.role === 'super_seller'
        ? productsData.products.filter((product) => product.vendorId === seller.vendorId)
        : productsData.products.filter(
            (product) => product.vendorId === seller.vendorId && product.sellerId === seller.id,
          );

    const inventory: SellerInventoryItem[] = products.map((product) => ({
      productId: product.id,
      vendorId: product.vendorId,
      sellerId: product.sellerId,

      productName: product.name,
      productImage: product.images[0] ?? null,

      sku: product.inventory.sku,
      barcode: product.inventory.barcode,

      quantity: product.inventory.quantity,

      reservedQuantity: product.inventory.reservedQuantity,

      availableQuantity: product.inventory.availableQuantity,

      lowStockThreshold: product.inventory.lowStockThreshold,

      status: getStockStatus(
        product.inventory.availableQuantity,
        product.inventory.lowStockThreshold,
      ),

      updatedAt: product.updatedAt,
    }));

    const summary: InventorySummary = {
      totalProducts: inventory.length,

      totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),

      availableUnits: inventory.reduce((sum, item) => sum + item.availableQuantity, 0),

      reservedUnits: inventory.reduce((sum, item) => sum + item.reservedQuantity, 0),

      lowStockProducts: inventory.filter((item) => item.status === 'low_stock').length,

      outOfStockProducts: inventory.filter((item) => item.status === 'out_of_stock').length,
    };

    return NextResponse.json({
      inventory,
      summary,
    });
  } catch (error) {
    console.error('GET /api/seller/inventory error:', error);

    return NextResponse.json(
      {
        message: 'Unable to load inventory.',
      },
      {
        status: 500,
      },
    );
  }
}
