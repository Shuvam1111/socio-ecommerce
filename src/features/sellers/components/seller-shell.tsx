'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronDown, Menu, Search } from 'lucide-react';

import { SellerSidebar } from './seller-sidebar';

interface SellerShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

interface SellerSession {
  firstName?: string;
  lastName?: string;
  username?: string;
  sellerRole?: string;
  role?: string;
}

export function SellerShell({ children, title, description }: SellerShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<SellerSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('socio-seller');
    if (!stored) return;
    try {
      setSession(JSON.parse(stored) as SellerSession);
    } catch {
      localStorage.removeItem('socio-seller');
    }
  }, []);

  const isSuperSeller = session?.sellerRole === 'super_seller' || session?.role === 'super_seller';
  const name = session?.firstName || session?.username || 'Seller';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-muted/30 text-foreground">
      <SellerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isSuperSeller={isSuperSeller}
      />
      <div className="min-w-0 flex-1 overflow-y-auto lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
              aria-label="Open seller navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{title}</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Search"
              >
                <Search className="size-4" />
              </button>
              <button
                type="button"
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
              </button>
            </div>
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="hidden text-left lg:block">
                <p className="max-w-28 truncate text-sm font-medium">{name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isSuperSeller ? 'Super seller' : 'Seller account'}
                </p>
              </div>
              <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
