import { NextResponse } from 'next/server';
import {
  getMarketplaceProductBySlug,
  toMarketplaceProduct,
} from '@/features/marketplace/services/marketplace-service';
import { loadCategories, loadSubcategories } from '@/features/catalog/services/taxonomy-service';
import { getReviews, getReviewSummary } from '@/features/reviews/services/review-service';

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const product = await getMarketplaceProductBySlug((await params).slug);
    if (!product) return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    const [categories, subcategories] = await Promise.all([loadCategories(), loadSubcategories()]);
    const category = categories.find((item) => item.id === product.categoryId);
    const subcategory = product.subcategoryId
      ? subcategories.find((item) => item.id === product.subcategoryId)
      : null;
    if (
      !category ||
      category.status !== 'active' ||
      (subcategory && subcategory.status !== 'active')
    )
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    const [reviews, reviewSummary] = await Promise.all([getReviews(product.id), getReviewSummary(product.id)]);
    return NextResponse.json({
      product: { ...toMarketplaceProduct(product, category.name, subcategory?.name ?? null), rating: reviewSummary },
      reviews,
    });
  } catch {
    return NextResponse.json({ message: 'Unable to load product.' }, { status: 500 });
  }
}
