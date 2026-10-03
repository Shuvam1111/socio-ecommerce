'use client';

import Link from 'next/link';
import { ChevronDown, CircleUserRound, LogOut, Moon, ShoppingCart, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { useCart } from '@/features/marketplace/components/use-cart';
import { useTheme } from '@/components/theme/theme-provider';

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { cart } = useCart();
  const { mode, setMode } = useTheme();
  const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const [buyer, setBuyer] = useState<{ firstName?: string } | null>(null);
  const [sellerLoggedIn, setSellerLoggedIn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedUser = localStorage.getItem('socio-user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.roles?.includes('buyer')) setBuyer(parsed);
        } catch {
          setBuyer(null);
        }
      }
      setSellerLoggedIn(Boolean(localStorage.getItem('socio-seller')));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  async function handleLogout() {
    if (buyer) {
      localStorage.removeItem('socio-user');
      localStorage.removeItem('socio-user-token');
      setBuyer(null);
      router.replace('/');
      return;
    }
    await fetch('/api/auth/seller/logout', { method: 'POST' });
    localStorage.removeItem('socio-seller');
    localStorage.removeItem('socio-seller-token');
    setSellerLoggedIn(false);
    router.replace('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/"
          aria-label="Socio Commerce home"
          className="shrink-0 text-lg font-bold tracking-tight text-foreground"
        >
          Socio<span className="text-primary">.</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-5 lg:flex">
          <Link
            href="/marketplace"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Shop
          </Link>
          <Link
            href="/register/vendor"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Become a vendor
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <button
            type="button"
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {mode === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          {buyer && <NotificationCenter />}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {buyer ? (
            <>
              <Link
                href="/user/profile"
                aria-label="Profile"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
              >
                <CircleUserRound className="size-5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary sm:block"
              >
                Logout
              </button>
            </>
          ) : sellerLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              <LogOut className="size-4" />
            </button>
          ) : (
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 [&::-webkit-details-marker]:hidden">
                Login
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-border bg-popover p-2 shadow-xl">
                <Link
                  href="/user/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Login as buyer
                </Link>
                <Link
                  href="/seller/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Seller login
                </Link>
                <Link
                  href="/admin/login"
                  className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  Admin login
                </Link>
                <Link
                  href="/register/user"
                  className="mt-1 block rounded-lg border-t border-border px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                >
                  Create account
                </Link>
              </div>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
