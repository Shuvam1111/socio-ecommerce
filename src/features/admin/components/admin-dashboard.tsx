'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  MessageSquare,
  Package,
  ShoppingCart,
  Store,
  UserCheck,
  Users,
  UserRoundCog,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminStatCard } from './admin-stat-card';

import type { AdminStats } from '../types/admin';
import { getAdminStats } from '../services/admin-service';

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalVendors: 0,
  pendingVendors: 0,
  totalSellers: 0,
  totalProducts: 0,
  totalOrders: 0,
  totalReviews: 0,
};

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(defaultStats);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardStats = await getAdminStats();

        setStats(dashboardStats);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load dashboard.';

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>

        <p className="mt-2 text-muted-foreground">Overview of your Social Commerce platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Total Vendors"
          value={stats.totalVendors}
          icon={Store}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Pending Vendors"
          value={stats.pendingVendors}
          icon={UserCheck}
          isLoading={isLoading}
          description="Awaiting approval"
        />

        <AdminStatCard
          title="Total Sellers"
          value={stats.totalSellers}
          icon={UserRoundCog}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Reviews"
          value={stats.totalReviews}
          icon={MessageSquare}
          isLoading={isLoading}
        />

        <AdminStatCard
          title="Delivered Orders"
          value={stats.deliveredOrders ?? 0}
          icon={BarChart3}
          isLoading={isLoading}
          description="Completed fulfillment"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href="/admin/vendors/pending"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium text-foreground">Review Vendors</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Review pending vendor registrations.
              </p>
            </a>

            <a
              href="/admin/users"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium text-foreground">Manage Users</p>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage registered users.
              </p>
            </a>

            <a
              href="/admin/products"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium text-foreground">Manage Products</p>

              <p className="mt-1 text-sm text-muted-foreground">Manage marketplace products.</p>
            </a>

            <a
              href="/admin/categories"
              className="rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium text-foreground">Manage Categories</p>

              <p className="mt-1 text-sm text-muted-foreground">Manage product categories.</p>
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Platform Status</h2>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User Registration</span>

              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vendor Registration</span>

              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vendor Approval</span>

              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Orders</span>

              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
