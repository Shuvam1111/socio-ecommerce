'use client';

import { SellerOrdersPage } from '@/features/sellers';
import { SellerShell } from '@/features/sellers/components/seller-shell';

export default function SellerOrdersRoute() {
  return (
    <SellerShell title="Orders" description="Review and manage customer orders">
      <SellerOrdersPage />
    </SellerShell>
  );
}
