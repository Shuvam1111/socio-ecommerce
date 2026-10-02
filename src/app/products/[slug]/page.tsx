import { notFound } from 'next/navigation';
import {
  getMarketplaceProductBySlug,
  toMarketplaceProduct,
} from '@/features/marketplace/services/marketplace-service';
import { loadCategories, loadSubcategories } from '@/features/catalog/services/taxonomy-service';
import { ProductDetail } from '@/features/marketplace/components/product-detail';
import { getReviews, getReviewSummary } from '@/features/reviews/services/review-service';
import { ReviewSection } from '@/features/reviews/components/review-section';
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getMarketplaceProductBySlug((await params).slug);
  if (!product) notFound();
  const [categories, subcategories] = await Promise.all([loadCategories(), loadSubcategories()]);
  const category = categories.find((item) => item.id === product.categoryId);
  const subcategory = product.subcategoryId
    ? subcategories.find((item) => item.id === product.subcategoryId)
    : null;
  if (!category || category.status !== 'active' || (subcategory && subcategory.status !== 'active'))
    notFound();
  const [reviews, reviewSummary] = await Promise.all([
    getReviews(product.id),
    getReviewSummary(product.id),
  ]);
  return (
    <>
      <ProductDetail
        product={{
          ...toMarketplaceProduct(product, category.name, subcategory?.name ?? null),
          rating: reviewSummary,
        }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ReviewSection productId={product.id} initialReviews={reviews} />
      </div>
    </>
  );
}
