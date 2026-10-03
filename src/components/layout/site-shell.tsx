'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';
import { MobileCommerceNav } from './mobile-commerce-nav';

type SiteShellProps = {
  readonly children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [isBareRoute, setIsBareRoute] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const pathname = window.location.pathname;
      setIsBareRoute(
        pathname === '/admin' ||
          pathname.startsWith('/admin/') ||
          pathname === '/seller/dashboard' ||
          pathname.startsWith('/seller/dashboard/'),
      );
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  if (isBareRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 text-foreground selection:bg-primary/20 md:pb-0">
      <SiteHeader />

      <main className="flex-1">{children}</main>

      <SiteFooter />
      <MobileCommerceNav />
    </div>
  );
}
