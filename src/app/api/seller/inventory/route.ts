import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/features/storage/services/json-storage-service';
import type { SellerProduct } from '@/features/sellers/types/product';
import type { InventorySummary, SellerInventoryItem } from '@/features/sellers/types/inventory';

export async function GET(request: NextRequest) {
  const sellerId = request.cookies.get('socio-seller-session')?.value;
  if (!sellerId)
    return NextResponse.json({ message: 'Seller authentication is required.' }, { status: 401 });

  const sellersData = await readJson<{
    sellers: Array<{
      id: string;
      vendorId: string;
      role: 'seller' | 'super_seller';
      status: 'active' | 'inactive';
    }>;
  }>('sellers.json');
  const seller = sellersData.sellers.find((item) => item.id === sellerId);
  if (!seller) return NextResponse.json({ message: 'Seller not found.' }, { status: 401 });
  if (seller.status !== 'active')
    return NextResponse.json(
      { message: 'Inactive sellers cannot access inventory.' },
      { status: 403 },
    );

  const productsData = await readJson<{ products: SellerProduct[] }>('products.json');
  const products = productsData.products.filter(
    (product) =>
      product.vendorId === seller.vendorId &&
      (seller.role === 'super_seller' || product.sellerId === seller.id),
  );
  const inventory: SellerInventoryItem[] = products.map((product) => {
    const stockStatus =
      product.inventory.availableQuantity <= 0
        ? 'out_of_stock'
        : product.inventory.availableQuantity <= product.inventory.lowStockThreshold
          ? 'low_stock'
          : 'in_stock';
    return {
      productId: product.id,
      vendorId: product.vendorId,
      sellerId: product.sellerId,
      productName: product.name,
      productImage: product.images[0] ?? null,
      ...product.inventory,
      status: stockStatus,
      updatedAt: product.updatedAt,
    };
  });
  const summary: InventorySummary = {
    totalProducts: inventory.length,
    totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
    availableUnits: inventory.reduce((sum, item) => sum + item.availableQuantity, 0),
    reservedUnits: inventory.reduce((sum, item) => sum + item.reservedQuantity, 0),
    lowStockProducts: inventory.filter((item) => item.status === 'low_stock').length,
    outOfStockProducts: inventory.filter((item) => item.status === 'out_of_stock').length,
  };
  return NextResponse.json({ inventory, summary });
}

export async function POST() {
  return NextResponse.json(
    { message: 'Inventory quantities must be changed through the adjustment endpoint.' },
    { status: 405 },
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
