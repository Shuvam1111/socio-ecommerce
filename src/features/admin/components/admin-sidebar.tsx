'use client';

import Link from 'next/link';
import {
  BarChart3,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tag,
  Users,
  UserRoundCog,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigation = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Vendors',
    href: '/admin/vendors',
    icon: Store,
  },
  {
    label: 'Pending Vendors',
    href: '/admin/vendors/pending',
    icon: UserCheck,
  },
  {
    label: 'Sellers',
    href: '/admin/sellers',
    icon: UserRoundCog,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    label: 'Reviews',
    href: '/admin/reviews',
    icon: MessageSquare,
  },
  {
    label: 'Promotions',
    href: '/admin/promotions',
    icon: Tag,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex min-h-screen w-16 shrink-0 flex-col border-r border-border bg-card sm:w-64">
      <div className="border-b border-border px-2 py-5 sm:px-6">
        <Link
          href="/admin"
          className="block truncate text-center text-sm font-bold text-foreground sm:text-left sm:text-xl"
        >
          <span className="sm:hidden">SC</span>
          <span className="hidden sm:inline">Social Commerce</span>
        </Link>

        <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">
          Administration Panel
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2 sm:p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:justify-start sm:px-3"
            >
              <Icon className="size-4" />

              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-2 sm:p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:justify-start sm:px-3"
        >
          <LogOut className="size-4" />

          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
