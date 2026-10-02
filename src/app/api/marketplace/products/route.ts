import { NextRequest, NextResponse } from 'next/server';
import { queryMarketplaceProducts } from '@/features/marketplace/services/marketplace-service';

function numberParam(value: string | null) {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const limit = Math.min(40, Math.max(1, Number.parseInt(params.get('limit') ?? '12', 10) || 12));
  const minPrice = numberParam(params.get('minPrice'));
  const maxPrice = numberParam(params.get('maxPrice'));
  if (
    minPrice === null ||
    maxPrice === null ||
    (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice)
  )
    return NextResponse.json({ message: 'Invalid price filters.' }, { status: 400 });
  try {
    return NextResponse.json(
      await queryMarketplaceProducts({
        search: params.get('search') ?? undefined,
        categoryId: params.get('categoryId') ?? undefined,
        subcategoryId: params.get('subcategoryId') ?? undefined,
        minPrice,
        maxPrice,
        sort:
          (params.get('sort') as
            'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'sold') ?? 'relevance',
        page,
        limit,
      }),
    );
  } catch {
    return NextResponse.json({ message: 'Unable to load marketplace products.' }, { status: 500 });
  }
}
