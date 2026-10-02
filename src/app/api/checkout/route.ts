import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutOrder, resolveBuyerId } from '@/features/checkout/services/checkout-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const buyerId = await resolveBuyerId(
      request.headers.get('x-user-token'),
      request.cookies.get('socio-cart-id')?.value,
    );
    if (!buyerId) {
      return NextResponse.json({ message: 'Buyer authentication is required.' }, { status: 401 });
    }
    const order = await createCheckoutOrder(body.items, {
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      buyerId,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error ? Number(error.status) : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create order.' },
      { status },
    );
  }
}
