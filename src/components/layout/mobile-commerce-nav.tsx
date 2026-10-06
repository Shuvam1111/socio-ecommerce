
'use client';

import Link from 'next/link';
import {
  Home,
  LogIn,
  Package,
  ShoppingBag,
  UserRound,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function MobileCommerceNav() {
  const pathname = usePathname();

  const [buyer, setBuyer] = useState(false);
  const [seller, setSeller] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setBuyer(Boolean(localStorage.getItem('socio-user-token')));
      setSeller(Boolean(localStorage.getItem('socio-seller')));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  /*
   * NOT LOGGED IN
   * Home | Shop | Login | Join
   */
  if (!buyer && !seller) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
        <MobileLink
          href="/"
          icon={Home}
          label="Home"
          active={pathname === '/'}
        />

        <MobileLink
          href="/marketplace"
          icon={ShoppingBag}
          label="Shop"
          active={pathname.startsWith('/marketplace')}
        />

        <MobileLink
          href="/user/login"
          icon={LogIn}
          label="Login"
          active={pathname.startsWith('/user/login')}
        />

        <MobileLink
          href="/register/user"
          icon={UserPlus}
          label="Join"
          active={pathname.startsWith('/register')}
        />
      </nav>
    );
  }

  /*
   * SELLER LOGGED IN
   * Home | Dashboard | Orders | Profile
   */
  if (seller) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
        <MobileLink
          href="/"
          icon={Home}
          label="Home"
          active={pathname === '/'}
        />

        <MobileLink
          href="/seller/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          active={
            pathname === '/seller/dashboard' ||
            pathname.startsWith('/seller/dashboard/')
          }
        />

        <MobileLink
          href="/seller/dashboard/orders"
          icon={Package}
          label="Orders"
          active={pathname.startsWith('/seller/dashboard/orders')}
        />

        <MobileLink
          href="/user/profile"
          icon={UserRound}
          label="Profile"
          active={pathname.startsWith('/user/profile')}
        />
      </nav>
    );
  }

  /*
   * BUYER LOGGED IN
   * Home | Shop | Orders | Profile
   */
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
      <MobileLink
        href="/"
        icon={Home}
        label="Home"
        active={pathname === '/'}
      />

      <MobileLink
        href="/marketplace"
        icon={ShoppingBag}
        label="Shop"
        active={pathname.startsWith('/marketplace')}
      />

      <MobileLink
        href="/orders"
        icon={Package}
        label="Orders"
        active={pathname.startsWith('/orders')}
      />

      <MobileLink
        href="/user/profile"
        icon={UserRound}
        label="Profile"
        active={pathname.startsWith('/user/profile')}
      />
    </nav>
  );
}

function MobileLink({
  href,
  icon: Icon,
  label,
  active = false,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-primary'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

