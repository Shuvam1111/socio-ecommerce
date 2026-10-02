'use client';

import { SellerProductsPage } from '@/features/sellers';
import { SellerShell } from '@/features/sellers/components/seller-shell';

export default function SellerProductsRoute() {
  return (
    <SellerShell title="Products" description="Create, update, and organize your catalog">
      <SellerProductsPage />
    </SellerShell>
  );
}
