import { SellerHome } from '@/features/marketplace/components/seller-home';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  return <SellerHome />;
}
