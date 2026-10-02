import { NextRequest, NextResponse } from 'next/server';
import { getBuyerOrders, resolveBuyerId } from '@/features/checkout/services/checkout-service';
export async function GET(request: NextRequest) {
  const guestId = request.cookies.get('socio-cart-id')?.value;
  const buyerId = await resolveBuyerId(request.headers.get('x-user-token'), guestId);
  if (!buyerId) {
    return NextResponse.json({ message: 'Buyer authentication is required.' }, { status: 401 });
  }
  return NextResponse.json({ orders: await getBuyerOrders(buyerId) });
}
