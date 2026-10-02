import { NextRequest, NextResponse } from 'next/server';

import { readJson, readSeedJson } from '@/features/storage/services/json-storage-service';

import { transitionOrder } from '@/features/sellers/services/order-inventory-workflow';

interface Seller {
  id: string;
  vendorId: string;
  role: 'seller' | 'super_seller';
  status: 'active' | 'inactive';
}
interface OrdersFile {
  orders: Array<{
    id: string;
    vendorId: string;
    sellerId: string;
    status: string;
    payment: { status: string };
  }>;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId)
      return NextResponse.json({ message: 'Seller authentication is required.' }, { status: 401 });
    const { id } = await params;
    const [sellersData, ordersData] = await Promise.all([
      readJson<{ sellers: Seller[] }>(
        'sellers.json',
        await readSeedJson<{ sellers: Seller[] }>('sellers.json'),
      ),
      readJson<OrdersFile>('orders.json', await readSeedJson<OrdersFile>('orders.json')),
    ]);
    const seller = sellersData.sellers.find((item) => item.id === sellerId);
    if (!seller) return NextResponse.json({ message: 'Seller not found.' }, { status: 401 });
    if (seller.status !== 'active')
      return NextResponse.json(
        { message: 'Inactive sellers cannot process orders.' },
        { status: 403 },
      );
    const order = ordersData.orders.find((item) => item.id === id);
    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    if (
      order.vendorId !== seller.vendorId ||
      (seller.role !== 'super_seller' && order.sellerId !== seller.id)
    ) {
      return NextResponse.json(
        { message: 'You do not have access to this order.' },
        { status: 403 },
      );
    }
    const updatedOrder = await transitionOrder(id, 'processing', sellerId);
    return NextResponse.json({
      message: 'Order verified and inventory reserved successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to verify order.' },
      { status },
    );
  }
}
