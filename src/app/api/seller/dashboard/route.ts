import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { readJson } from '@/features/sellers/services/seller-authorization';
import type { SellerProduct } from '@/features/sellers/types/product';
import type { SellerOrder } from '@/features/sellers/types/order';

interface Seller {
  id: string;
  vendorId: string;
  role: 'seller' | 'super_seller';
  status: 'active' | 'inactive';
}

export async function GET() {
  const authenticatedSellerId = (await cookies()).get('socio-seller-session')?.value;

  if (!authenticatedSellerId) {
    return NextResponse.json({ message: 'Seller authentication is required.' }, { status: 401 });
  }

  const sellersData = await readJson<{ sellers: Seller[] }>('sellers.json');
  const seller = sellersData.sellers.find((item) => item.id === authenticatedSellerId);

  if (!seller || seller.status !== 'active') {
    return NextResponse.json({ message: 'Active seller account not found.' }, { status: 401 });
  }

  const [{ products }, { orders }] = await Promise.all([
    readJson<{ products: SellerProduct[] }>('products.json'),
    readJson<{ orders: SellerOrder[] }>('orders.json'),
  ]);

  const ownsResource = (resourceSellerId: string, resourceVendorId: string) =>
    resourceVendorId === seller.vendorId &&
    (seller.role === 'super_seller' || resourceSellerId === seller.id);

  return NextResponse.json({
    products: products.filter((product) => ownsResource(product.sellerId, product.vendorId)).length,
    orders: orders.filter((order) => ownsResource(order.sellerId, order.vendorId)).length,
  });
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
