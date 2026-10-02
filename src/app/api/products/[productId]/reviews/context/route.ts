import { NextResponse } from 'next/server';
import { buyerIdFromToken, getReviewContext } from '@/features/reviews/services/review-service';
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const buyerId = buyerIdFromToken(request.headers.get('x-user-token'));
  return NextResponse.json(
    buyerId
      ? await getReviewContext((await params).productId, buyerId)
      : { eligible: false, reviewed: false, reviewId: null },
  );
}
