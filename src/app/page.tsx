import { CommerceHome } from '@/features/marketplace/components/commerce-home';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { loadCategories } from '@/features/catalog/services/taxonomy-service';

export default async function Home() {
  const categories = (await loadCategories()).filter((category) => category.status === 'active');
  return <CommerceHome categories={categories} />;
}
