'use client';

import { SellerInventoryPage } from '@/features/sellers';
import { SellerShell } from '@/features/sellers/components/seller-shell';

export default function SellerInventoryRoute() {
  return (
    <SellerShell title="Inventory" description="Monitor stock levels and keep products available">
      <SellerInventoryPage />
    </SellerShell>
  );
}
