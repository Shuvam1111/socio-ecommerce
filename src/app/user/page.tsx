import { CommerceHome } from '@/features/marketplace/components/commerce-home';
import { loadCategories } from '@/features/catalog/services/taxonomy-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UserLandingPage() {
  const categories = (await loadCategories()).filter((category) => category.status === 'active');
  return <CommerceHome categories={categories} buyerOnly />;
}
