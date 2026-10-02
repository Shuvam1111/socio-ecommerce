'use client';

import { useEffect, useState } from 'react';
import { Heart, Menu, Package, Share2, ShoppingBag, Star, UserRound } from 'lucide-react';
import Link from 'next/link';

import { UserSidebar } from './user-sidebar';

interface DashboardUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [user, setUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('socio-user');

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as DashboardUser;

      setTimeout(() => {
        setUser(parsedUser);
      }, 0);
    } catch {
      localStorage.removeItem('socio-user');
    }
  }, []);

  const firstName = user?.firstName || 'User';

  return (
    <div className="flex min-h-screen bg-background">
      <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu className="size-6" />
          </button>

          <div>
            <h1 className="font-semibold text-foreground">Dashboard</h1>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Manage your Socio Commerce account
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {firstName}! 👋</h2>

            <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your account.</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title="Orders" value="0" description="Total orders" icon={Package} />

            <DashboardCard title="Reviews" value="0" description="Reviews submitted" icon={Star} />

            <DashboardCard title="Wishlist" value="0" description="Saved products" icon={Heart} />

            <DashboardCard title="Shared" value="0" description="Products shared" icon={Share2} />
          </div>

          {/* Account */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                  <UserRound className="size-5 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">Account Information</h3>

                  <p className="text-sm text-muted-foreground">Your account details</p>
                </div>
              </div>

              {user && (
                <div className="mt-6 space-y-3 text-sm">
                  <InfoRow label="Name" value={`${user.firstName} ${user.lastName}`} />

                  <InfoRow label="Username" value={`@${user.username}`} />

                  <InfoRow label="Email" value={user.email} />

                  <InfoRow label="Account ID" value={user.id} />
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground">Quick Actions</h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <QuickAction icon={ShoppingBag} label="Browse Products" href="/marketplace" />

                <QuickAction icon={Package} label="View Orders" href="/orders" />

                <QuickAction icon={Heart} label="View Cart" href="/cart" />

                <QuickAction icon={UserRound} label="View Profile" href="/user/profile" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>

      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Package;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="size-4 text-primary" />
      {label}
    </Link>
  );
}
