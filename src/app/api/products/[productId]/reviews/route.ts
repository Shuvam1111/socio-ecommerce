import { NextResponse } from 'next/server';
import {
  createReview,
  getBuyerReviewContext,
  getReviews,
  validateReviewInput,
  buyerIdFromToken,
} from '@/features/reviews/services/review-service';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  return NextResponse.json({ reviews: await getReviews((await params).productId) });
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const buyerId = buyerIdFromToken(request.headers.get('x-user-token'));
  if (!buyerId)
    return NextResponse.json({ message: 'Buyer authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!validateReviewInput(body))
    return NextResponse.json(
      { message: 'Rating, title, and comment are invalid.' },
      { status: 400 },
    );
  const productId = (await params).productId;
  const context = await getBuyerReviewContext(productId, request.headers.get('x-user-token'));
  if (!context.eligible)
    return NextResponse.json(
      {
        message: context.reviewed
          ? 'You have already reviewed this product.'
          : 'A delivered purchase is required.',
      },
      { status: context.reviewed ? 409 : 403 },
    );
  try {
    return NextResponse.json(
      { review: await createReview(productId, buyerId, body) },
      { status: 201 },
    );
  } catch (error) {
    const status =
      error instanceof Error && 'status' in error
        ? Number((error as { status: number }).status)
        : 500;
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to create review.' },
      { status },
    );
  }
}
