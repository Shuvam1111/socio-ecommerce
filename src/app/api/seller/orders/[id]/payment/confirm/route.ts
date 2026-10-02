import { NextRequest, NextResponse } from 'next/server';

import { readJson } from '@/features/storage/services/json-storage-service';
import {
  loadOrder,
  markPaymentReceived,
} from '@/features/sellers/services/order-inventory-workflow';
import type { SellerOrder } from '@/features/sellers/types/order';

interface Seller {
  id: string;
  vendorId: string;
  role: 'seller' | 'super_seller';
  status: 'active' | 'inactive';
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sellerId = request.headers.get('x-seller-id');
    if (!sellerId) {
      return NextResponse.json({ message: 'Seller authentication is required.' }, { status: 401 });
    }
    const { id } = await params;
    const { sellers } = await readJson<{ sellers: Seller[] }>('sellers.json', { sellers: [] });
    const seller = sellers.find((item) => item.id === sellerId);
    if (!seller) return NextResponse.json({ message: 'Seller not found.' }, { status: 401 });
    if (seller.status !== 'active') {
      return NextResponse.json(
        { message: 'Inactive sellers cannot confirm payments.' },
        { status: 403 },
      );
    }
    const order = (await loadOrder(id)) as SellerOrder | null;
    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    const authorized =
      order.vendorId === seller.vendorId &&
      (seller.role === 'super_seller' || order.sellerId === seller.id);
    if (!authorized) {
      return NextResponse.json(
        { message: 'You do not have access to this order.' },
        { status: 403 },
      );
    }
    const updatedOrder = await markPaymentReceived(id, sellerId);
    return NextResponse.json({ message: 'Payment marked as received.', order: updatedOrder });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to confirm payment.' },
      { status },
    );
  }
}

export const dynamic = 'force-dynamic';
