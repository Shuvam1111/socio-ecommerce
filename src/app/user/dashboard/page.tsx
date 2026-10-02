import { CommerceHome } from '@/features/marketplace/components/commerce-home';
import { loadCategories } from '@/features/catalog/services/taxonomy-service';

export default async function UserDashboardPage() {
  const categories = (await loadCategories()).filter((category) => category.status === 'active');
  return <CommerceHome categories={categories} buyerOnly />;
}
