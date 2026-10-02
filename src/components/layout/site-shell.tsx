'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { MobileCommerceNav } from './mobile-commerce-nav';

type SiteShellProps = {
  readonly children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isSellerDashboardRoute =
    pathname === '/seller/dashboard' || pathname.startsWith('/seller/dashboard/');
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isSellerDashboardRoute || isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 text-foreground md:pb-0">
      <SiteHeader />

      <main className="flex-1">{children}</main>

      <SiteFooter />
      <MobileCommerceNav />
    </div>
  );
}
