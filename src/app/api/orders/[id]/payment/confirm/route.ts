import { NextRequest, NextResponse } from 'next/server';

import { confirmPayment } from '@/features/sellers/services/order-inventory-workflow';
import { getBuyerOrder, resolveBuyerId } from '@/features/checkout/services/checkout-service';
import { createMockTransactionId } from '@/features/checkout/services/mock-payment-service';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guestId = request.headers.get('x-cart-id') ?? request.cookies.get('socio-cart-id')?.value;
    if (!guestId) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    const buyerId = await resolveBuyerId(request.headers.get('x-user-token'), guestId);
    if (!buyerId || !(await getBuyerOrder(buyerId, id))) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }
    const order = await confirmPayment(id, createMockTransactionId());
    return NextResponse.json({ message: 'Payment confirmed successfully.', order });
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
