import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { listReviews, moderateReview } from '@/features/reviews/services/review-service';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ reviews: await listReviews() });
}
export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== 'string' || !['approved', 'rejected'].includes(body.status))
    return NextResponse.json(
      { message: 'Review id and moderation status are required.' },
      { status: 400 },
    );
  try {
    return NextResponse.json({ review: await moderateReview(body.id, body.status) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to moderate review.' },
      { status: 404 },
    );
  }
}
