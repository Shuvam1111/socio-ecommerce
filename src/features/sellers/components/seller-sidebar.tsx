'use client';

import { useRouter, usePathname } from 'next/navigation';

import {
  Box,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from 'lucide-react';

interface SellerSidebarProps {
  open: boolean;
  onClose: () => void;
  isSuperSeller: boolean;
}

const baseNavigation = [
  {
    label: 'Dashboard',
    href: '/seller/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/seller/dashboard/products',
    icon: Package,
  },
  {
    label: 'Inventory',
    href: '/seller/dashboard/inventory',
    icon: Box,
  },
  {
    label: 'Orders',
    href: '/seller/dashboard/orders',
    icon: ShoppingCart,
  },
];

const superSellerNavigation = {
  label: 'Manage Sellers',
  href: '/seller/dashboard/sellers',
  icon: UserRound,
};

const bottomNavigation = [
  {
    label: 'Store',
    href: '/seller/dashboard/store',
    icon: Store,
  },
  {
    label: 'Settings',
    href: '/seller/dashboard/settings',
    icon: Settings,
  },
];

export function SellerSidebar({ open, onClose, isSuperSeller }: SellerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = isSuperSeller
    ? [...baseNavigation, superSellerNavigation, ...bottomNavigation]
    : [...baseNavigation, ...bottomNavigation];

  async function handleLogout() {
    await fetch('/api/auth/seller/logout', { method: 'POST' });
    localStorage.removeItem('socio-seller');
    localStorage.removeItem('socio-seller-token');
    router.replace('/seller/login');
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div>
            <p className="font-bold text-foreground">Socio Commerce</p>
            <p className="text-xs text-muted-foreground">Seller Dashboard</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
