'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';

import { AdminPagination } from './admin-pagination';
import { getAdminSellers, type AdminSeller } from '../services/seller-admin-service';

type SellerFilter = 'all' | 'super_seller' | 'seller' | 'active' | 'inactive';

export function AdminSellers() {
  const [sellers, setSellers] = useState<AdminSeller[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<SellerFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function loadSellers() {
    try {
      setLoading(true);
      setError('');

      const data = await getAdminSellers();

      setSellers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to load sellers.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSellers();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredSellers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sellers.filter((seller) => {
      let matchesFilter = true;

      if (filter === 'super_seller' || filter === 'seller') {
        matchesFilter = seller.role === filter;
      }

      if (filter === 'active' || filter === 'inactive') {
        matchesFilter = seller.status === filter;
      }

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        seller.id.toLowerCase().includes(query) ||
        seller.userId.toLowerCase().includes(query) ||
        seller.vendorId.toLowerCase().includes(query) ||
        seller.employee.employeeCode.toLowerCase().includes(query) ||
        seller.employee.designation.toLowerCase().includes(query)
      );
    });
  }, [sellers, search, filter]);

  const counts = useMemo(
    () => ({
      all: sellers.length,

      superSellers: sellers.filter((seller) => seller.role === 'super_seller').length,

      sellers: sellers.filter((seller) => seller.role === 'seller').length,

      active: sellers.filter((seller) => seller.status === 'active').length,

      inactive: sellers.filter((seller) => seller.status === 'inactive').length,
    }),
    [sellers],
  );

  const totalPages = Math.max(1, Math.ceil(filteredSellers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedSellers = filteredSellers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function getStatusBadge(status: AdminSeller['status']) {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="size-3.5" />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <XCircle className="size-3.5" />
        Inactive
      </span>
    );
  }

  function getRoleBadge(role: AdminSeller['role']) {
    if (role === 'super_seller') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="size-3.5" />
          Super Seller
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
        <UserRound className="size-3.5" />
        Seller
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          Loading sellers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">Unable to load sellers</h2>

        <p className="mt-1 text-sm text-muted-foreground">{error}</p>

        <button
          type="button"
          onClick={() => void loadSellers()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <RefreshCw className="size-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Sellers</h1>

            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {sellers.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage vendor sellers and Super Sellers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSellers()}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === 'all'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <Users className="size-5 text-primary" />

          <p className="mt-2 text-sm text-muted-foreground">All</p>

          <p className="text-2xl font-bold text-foreground">{counts.all}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('super_seller')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === 'super_seller'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <ShieldCheck className="size-5 text-primary" />

          <p className="mt-2 text-sm text-muted-foreground">Super Sellers</p>

          <p className="text-2xl font-bold text-foreground">{counts.superSellers}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('seller')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === 'seller'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <UserRound className="size-5 text-primary" />

          <p className="mt-2 text-sm text-muted-foreground">Sellers</p>

          <p className="text-2xl font-bold text-foreground">{counts.sellers}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === 'active'
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <CheckCircle2 className="size-5 text-primary" />

          <p className="mt-2 text-sm text-muted-foreground">Active</p>

          <p className="text-2xl font-bold text-foreground">{counts.active}</p>
        </button>

        <button
          type="button"
          onClick={() => setFilter('inactive')}
          className={`rounded-xl border p-4 text-left transition-colors ${
            filter === 'inactive'
              ? 'border-destructive bg-destructive/5'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <Clock3 className="size-5 text-muted-foreground" />

          <p className="mt-2 text-sm text-muted-foreground">Inactive</p>

          <p className="text-2xl font-bold text-foreground">{counts.inactive}</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by seller ID, user ID, vendor ID, employee code or designation..."
          className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Table */}
      {filteredSellers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Users className="mx-auto size-10 text-muted-foreground" />

          <h2 className="mt-4 text-lg font-semibold text-foreground">No sellers found</h2>

          <p className="mt-1 text-sm text-muted-foreground">Try changing your search or filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Seller
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vendor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Permissions
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {pagedSellers.map((seller) => (
                  <tr key={seller.id} className="transition-colors hover:bg-muted/30">
                    {/* Seller */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <UserRound className="size-5 text-primary" />
                        </div>

                        <div>
                          <p className="font-medium text-foreground">{seller.id}</p>

                          <p className="text-xs text-muted-foreground">User: {seller.userId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Vendor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="size-4 text-muted-foreground" />

                        <span className="text-sm text-foreground">{seller.vendorId}</span>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {seller.employee.designation}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {seller.employee.employeeCode}
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">{getRoleBadge(seller.role)}</td>

                    {/* Permissions */}
                    <td className="px-5 py-4">
                      <div className="max-w-[250px]">
                        <div className="flex flex-wrap gap-1.5">
                          {seller.permissions.slice(0, 3).map((permission) => (
                            <span
                              key={permission}
                              className="rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground"
                            >
                              {permission.replace(/_/g, ' ')}
                            </span>
                          ))}

                          {seller.permissions.length > 3 && (
                            <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                              +{seller.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">{getStatusBadge(seller.status)}</td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(seller.employee.joiningDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Showing {filteredSellers.length} of {sellers.length} sellers
          </div>
          <div className="px-5 pb-5">
            <AdminPagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredSellers.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
