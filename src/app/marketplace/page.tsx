import { MarketplaceBrowser } from '@/features/marketplace/components/marketplace-browser';
import { loadCategories, loadSubcategories } from '@/features/catalog/services/taxonomy-service';
export default async function MarketplacePage() {
  const [categories, subcategories] = await Promise.all([loadCategories(), loadSubcategories()]);
  return (
    <MarketplaceBrowser
      categories={categories.filter((item) => item.status === 'active')}
      subcategories={subcategories.filter((item) => item.status === 'active')}
    />
  );
}
