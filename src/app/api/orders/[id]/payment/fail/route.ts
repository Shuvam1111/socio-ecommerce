import { NextRequest, NextResponse } from 'next/server';
import { failPayment } from '@/features/sellers/services/order-inventory-workflow';
import { getBuyerOrder, resolveBuyerId } from '@/features/checkout/services/checkout-service';

async function authorize(request: NextRequest, id: string) {
  const guestId = request.cookies.get('socio-cart-id')?.value;
  if (!guestId) return null;
  const buyerId = await resolveBuyerId(request.headers.get('x-user-token'), guestId);
  return buyerId ? getBuyerOrder(buyerId, id) : null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    if (!(await authorize(request, id)))
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    const order = await failPayment(id);
    return NextResponse.json({ message: 'Mock payment failed.', order });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to fail payment.' },
      { status },
    );
  }
}

export const dynamic = 'force-dynamic';
