'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { BarChart3, Box, Package, ShoppingCart, Store, Users } from 'lucide-react';

import { SellerShell } from './seller-shell';

interface SellerUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  sellerId?: string;
  sellerRole?: 'seller' | 'super_seller';
  vendorId?: string;
  permissions?: string[];
}

export function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<SellerUser | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0 });

  useEffect(() => {
    const storedSeller = localStorage.getItem('socio-seller');

    if (!storedSeller) {
      return;
    }

    try {
      const parsedSeller = JSON.parse(storedSeller) as SellerUser;

      setTimeout(() => {
        setUser(parsedSeller);
      }, 0);
    } catch {
      localStorage.removeItem('socio-seller');
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/seller/dashboard', { cache: 'no-store' });
        const result = (await response.json()) as {
          products?: number;
          orders?: number;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(result.message || 'Unable to load dashboard stats.');
        }

        setStats({ products: result.products ?? 0, orders: result.orders ?? 0 });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to load dashboard stats.');
      }
    };

    void loadStats();
  }, []);

  const firstName = user?.firstName || 'Seller';

  const isSuperSeller = user?.sellerRole === 'super_seller';

  return (
    <SellerShell title="Overview" description="Track your store performance and daily operations">
      <div>
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {firstName}! 👋</h2>

            {isSuperSeller && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Super Seller
              </span>
            )}
          </div>

          <p className="mt-1 text-muted-foreground">
            Manage your products, inventory, orders and store.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Products"
            value={String(stats.products)}
            description="Total products"
            icon={Package}
          />

          <DashboardCard
            title="Orders"
            value={String(stats.orders)}
            description="Total orders"
            icon={ShoppingCart}
          />

          <DashboardCard title="Sales" value="Rs. 0" description="Total sales" icon={BarChart3} />

          <DashboardCard title="Customers" value="0" description="Total customers" icon={Users} />
        </div>

        {/* Store Overview */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
                <Store className="size-5 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">Store Information</h3>

                <p className="text-sm text-muted-foreground">Your seller account</p>
              </div>
            </div>

            {user && (
              <div className="mt-6 space-y-3 text-sm">
                <InfoRow label="Seller ID" value={user.sellerId || '—'} />

                <InfoRow label="Vendor ID" value={user.vendorId || '—'} />

                <InfoRow label="Role" value={isSuperSeller ? 'Super Seller' : 'Seller'} />

                <InfoRow label="Username" value={`@${user.username}`} />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QuickAction
                icon={Package}
                label="Add Product"
                onClick={() => router.push('/seller/dashboard/products')}
              />

              <QuickAction
                icon={Box}
                label="Manage Inventory"
                onClick={() => router.push('/seller/dashboard/inventory')}
              />

              <QuickAction
                icon={ShoppingCart}
                label="View Orders"
                onClick={() => router.push('/seller/dashboard/orders')}
              />

              <QuickAction
                icon={BarChart3}
                label="View Sales"
                onClick={() => router.push('/seller/dashboard')}
              />
            </div>
          </div>
        </div>

        {/* Super Seller Section */}
        {isSuperSeller && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">Super Seller Access</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  You can manage sellers, seller permissions, products, inventory and orders for
                  your vendor.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(user?.permissions ?? []).slice(0, 6).map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {permission.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SellerShell>
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
  onClick,
}: {
  icon: typeof Package;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <Icon className="size-4 text-primary" />
      {label}
    </button>
  );
}
