import { NextResponse } from 'next/server';

const response = () =>
  NextResponse.json(
    {
      message: 'Buyer carts are managed in the browser now. Use the checkout endpoint for orders.',
    },
    { status: 410 },
  );

export function GET() {
  return response();
}

export function POST() {
  return response();
}
