import { NextRequest, NextResponse } from 'next/server';
import { readJson } from '@/features/storage/services/json-storage-service';
import type { SellerOrder, OrderStatus } from '@/features/sellers/types/order';
import { transitionOrder } from '@/features/sellers/services/order-inventory-workflow';

interface StoredSeller {
  id: string;
  userId: string;
  vendorId: string;
  role: 'super_seller' | 'seller';
  status: 'active' | 'inactive';
}

interface SellersData {
  sellers: StoredSeller[];
}

interface OrdersData {
  orders: SellerOrder[];
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
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

    const { id } = await context.params;

    const [sellersData, ordersData] = await Promise.all([
      readJson<SellersData>('sellers.json', { sellers: [] }),
      readJson<OrdersData>('orders.json', { orders: [] }),
    ]);

    const seller = sellersData.sellers.find(
      (item) => item.id === sellerId && item.status === 'active',
    );

    if (!seller) {
      return NextResponse.json(
        {
          message: 'Seller not found.',
        },
        { status: 404 },
      );
    }

    const order = ordersData.orders.find((item) => item.id === id);

    if (!order) {
      return NextResponse.json(
        {
          message: 'Order not found.',
        },
        { status: 404 },
      );
    }

    const hasAccess =
      order.vendorId === seller.vendorId &&
      (seller.role === 'super_seller' || order.sellerId === seller.id);

    if (!hasAccess) {
      return NextResponse.json(
        {
          message: 'You do not have access to this order.',
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error('Failed to load seller order:', error);

    return NextResponse.json(
      {
        message: 'Unable to load order.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId)
      return NextResponse.json({ message: 'Seller authentication is required.' }, { status: 401 });
    const { id } = await params;
    const body = (await request.json()) as { status?: OrderStatus };
    const allowed: OrderStatus[] = [
      'processing',
      'ready_to_deliver',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refund_requested',
      'refunded',
    ];
    if (!body.status || !allowed.includes(body.status))
      return NextResponse.json({ message: 'Invalid order status.' }, { status: 400 });
    const sellers = await readJson<SellersData>('sellers.json', { sellers: [] });
    const seller = sellers.sellers.find((item) => item.id === sellerId);
    if (!seller) return NextResponse.json({ message: 'Seller not found.' }, { status: 401 });
    if (seller.status !== 'active')
      return NextResponse.json(
        { message: 'Inactive sellers cannot process orders.' },
        { status: 403 },
      );
    const orders = await readJson<OrdersData>('orders.json', { orders: [] });
    const order = orders.orders.find((item) => item.id === id);
    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    if (
      order.vendorId !== seller.vendorId ||
      (seller.role !== 'super_seller' && order.sellerId !== seller.id)
    )
      return NextResponse.json(
        { message: 'You do not have access to this order.' },
        { status: 403 },
      );
    return NextResponse.json({
      message: 'Order updated successfully.',
      order: await transitionOrder(id, body.status, sellerId),
    });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to update order.' },
      { status },
    );
  }
}
