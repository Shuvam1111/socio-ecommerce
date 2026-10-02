import { NextRequest, NextResponse } from 'next/server';
import { getBuyerOrder, resolveBuyerId } from '@/features/checkout/services/checkout-service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guestId = request.cookies.get('socio-cart-id')?.value;
    const buyerId = await resolveBuyerId(request.headers.get('x-user-token'), guestId);
    if (!buyerId) {
      return NextResponse.json({ message: 'Buyer authentication is required.' }, { status: 401 });
    }
    const order = await getBuyerOrder(buyerId, id);
    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('[orders] order retrieval failed', error);
    return NextResponse.json({ message: 'Unable to retrieve order.' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
