'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react';

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Shop / Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: ShoppingCart,
  },
  {
    label: 'My Orders',
    href: '/orders',
    icon: Package,
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'Profile',
    href: '/user/profile',
    icon: UserRound,
  },
];

export function UserSidebar({ open, onClose }: UserSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    localStorage.removeItem('socio-user');
    localStorage.removeItem('socio-user-token');

    router.push('/user/login');
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

            <p className="text-xs text-muted-foreground">User Dashboard</p>
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

            const active = pathname === item.href;

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
