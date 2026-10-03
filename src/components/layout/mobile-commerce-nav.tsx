'use client';

import Link from 'next/link';
import { Home, LogIn, Package, ShoppingBag, ShoppingCart, UserRound, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/features/marketplace/components/use-cart';

export function MobileCommerceNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const [buyer, setBuyer] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setBuyer(Boolean(localStorage.getItem('socio-user-token'))),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden">
      <MobileLink href="/" icon={Home} label="Home" active={pathname === '/'} />
      <MobileLink
        href="/marketplace"
        icon={ShoppingBag}
        label="Shop"
        active={pathname.startsWith('/marketplace')}
      />
      <MobileLink
        href={buyer ? '/cart' : '/user/login'}
        icon={ShoppingCart}
        label="Cart"
        active={pathname.startsWith('/cart')}
        badge={buyer ? cart.count : 0}
      />
      <MobileLink
        href={buyer ? '/orders' : '/user/login'}
        icon={buyer ? Package : LogIn}
        label={buyer ? 'Orders' : 'Login'}
        active={pathname.startsWith('/orders')}
      />
      <MobileLink
        href={buyer ? '/user/profile' : '/register/user'}
        icon={buyer ? UserRound : UserPlus}
        label={buyer ? 'Profile' : 'Join'}
        active={buyer ? pathname.startsWith('/user/profile') : pathname.startsWith('/register')}
      />
    </nav>
  );
}

function MobileLink({
  href,
  icon: Icon,
  label,
  active = false,
  badge = 0,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
    >
      <span className="relative">
        <Icon className="size-4" />
        {badge > 0 && (
          <span
            key={badge}
            className="absolute -right-2.5 -top-2 flex h-4 min-w-4 animate-cart-pop items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-background"
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      {label}
    </Link>
  );
}
