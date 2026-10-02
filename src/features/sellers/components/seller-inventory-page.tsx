'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Box,
  CheckCircle2,
  Package,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  adjustSellerInventory,
  getSellerInventory,
} from '../services/seller-inventory-service';

import type {
  InventoryAdjustmentType,
  SellerInventoryItem,
} from '../types/inventory';

type StockFilter =
  | 'all'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

interface AdjustmentState {
  product: SellerInventoryItem;
  type: InventoryAdjustmentType;
}

function getStockLabel(
  status: SellerInventoryItem['status'],
) {
  if (status === 'out_of_stock') {
    return 'Out of stock';
  }

  if (status === 'low_stock') {
    return 'Low stock';
  }

  return 'In stock';
}

export function SellerInventoryPage() {
  const [inventory, setInventory] =
    useState<SellerInventoryItem[]>(
      [],
    );

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [stockFilter, setStockFilter] =
    useState<StockFilter>('all');

  const [
    adjustment,
    setAdjustment,
  ] =
    useState<AdjustmentState | null>(
      null,
    );

  const [quantity, setQuantity] =
    useState('');

  const [reason, setReason] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  async function loadInventory(
    showLoading = true,
  ) {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const result =
        await getSellerInventory();

      setInventory(
        result.inventory,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load inventory.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        void loadInventory();
      }, 0);

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, []);

  const filteredInventory =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return inventory.filter(
        (item) => {
          const matchesSearch =
            !query ||
            item.productName
              .toLowerCase()
              .includes(query) ||
            item.sku
              .toLowerCase()
              .includes(query) ||
            item.barcode
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            stockFilter === 'all' ||
            item.status ===
              stockFilter;

          return (
            matchesSearch &&
            matchesFilter
          );
        },
      );
    }, [
      inventory,
      search,
      stockFilter,
    ]);

  const stats =
    useMemo(() => {
      return {
        products:
          inventory.length,

        totalUnits:
          inventory.reduce(
            (sum, item) =>
              sum + item.quantity,
            0,
          ),

        availableUnits:
          inventory.reduce(
            (sum, item) =>
              sum +
              item.availableQuantity,
            0,
          ),

        reservedUnits:
          inventory.reduce(
            (sum, item) =>
              sum +
              item.reservedQuantity,
            0,
          ),

        lowStock:
          inventory.filter(
            (item) =>
              item.status ===
              'low_stock',
          ).length,

        outOfStock:
          inventory.filter(
            (item) =>
              item.status ===
              'out_of_stock',
          ).length,
      };
    }, [inventory]);

  function openAdjustment(
    product: SellerInventoryItem,
    type: InventoryAdjustmentType,
  ) {
    setAdjustment({
      product,
      type,
    });

    setQuantity('');
    setReason('');
  }

  function closeAdjustment() {
    if (saving) {
      return;
    }

    setAdjustment(null);
    setQuantity('');
    setReason('');
  }

  async function handleAdjustmentSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!adjustment) {
      return;
    }

    const amount =
      Number(quantity);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      toast.error(
        'Enter a valid positive whole number.',
      );
      return;
    }

    if (
      adjustment.type ===
        'decrease' &&
      amount >
        adjustment.product
          .availableQuantity
    ) {
      toast.error(
        'You cannot decrease more than the available stock.',
      );
      return;
    }

    if (!reason.trim()) {
      toast.error(
        'Please enter a reason for the adjustment.',
      );
      return;
    }

    try {
      setSaving(true);

      await adjustSellerInventory(
        adjustment.product
          .productId,
        {
          type: adjustment.type,
          quantity: amount,
          reason:
            reason.trim(),
        },
      );

      toast.success(
        adjustment.type ===
          'increase'
          ? 'Stock increased successfully.'
          : 'Stock decreased successfully.',
      );

      closeAdjustment();

      await loadInventory(
        false,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to adjust inventory.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Inventory
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage stock levels for your products.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void loadInventory(
                false,
              )
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              className={
                refreshing
                  ? 'size-4 animate-spin'
                  : 'size-4'
              }
            />

            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Products"
            value={stats.products}
            icon={Package}
          />

          <StatCard
            label="Total Units"
            value={stats.totalUnits}
            icon={Box}
          />

          <StatCard
            label="Available"
            value={stats.availableUnits}
            icon={CheckCircle2}
          />

          <StatCard
            label="Reserved"
            value={stats.reservedUnits}
            icon={Box}
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            icon={AlertTriangle}
          />

          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            icon={XCircle}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search product, SKU or barcode..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target
                    .value as StockFilter,
                )
              }
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="all">
                All Stock
              </option>

              <option value="in_stock">
                In Stock
              </option>

              <option value="low_stock">
                Low Stock
              </option>

              <option value="out_of_stock">
                Out of Stock
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-primary" />
            </div>
          ) : filteredInventory.length ===
            0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <Package className="size-10 text-muted-foreground" />

              <h2 className="mt-3 font-semibold text-foreground">
                No inventory found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or stock filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Product
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      SKU
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Total
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Reserved
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Available
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Threshold
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map(
                    (item) => (
                      <tr
                        key={
                          item.productId
                        }
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                              {item.productImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={
                                    item.productImage
                                  }
                                  alt={
                                    item.productName
                                  }
                                  className="size-full object-cover"
                                />
                              ) : (
                                <Package className="size-5 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate font-medium text-foreground">
                                {
                                  item.productName
                                }
                              </p>

                              {item.barcode && (
                                <p className="text-xs text-muted-foreground">
                                  {
                                    item.barcode
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {item.sku}
                        </td>

                        <td className="px-5 py-4 font-medium text-foreground">
                          {item.quantity}
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {
                            item.reservedQuantity
                          }
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-foreground">
                            {
                              item.availableQuantity
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {
                            item.lowStockThreshold
                          }
                        </td>

                        <td className="px-5 py-4">
                          <StockBadge
                            status={
                              item.status
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openAdjustment(
                                  item,
                                  'increase',
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                              title="Increase stock"
                            >
                              <ArrowUp className="size-4" />

                              Add
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openAdjustment(
                                  item,
                                  'decrease',
                                )
                              }
                              disabled={
                                item.availableQuantity <=
                                0
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Decrease stock"
                            >
                              <ArrowDown className="size-4" />

                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {adjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-semibold text-foreground">
                {adjustment.type ===
                'increase'
                  ? 'Increase Stock'
                  : 'Decrease Stock'}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {adjustment.product.productName}
              </p>
            </div>

            <form
              onSubmit={
                handleAdjustmentSubmit
              }
              className="space-y-4 p-5"
            >
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary/50 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Current Stock
                  </p>

                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {
                      adjustment.product
                        .quantity
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Available
                  </p>

                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {
                      adjustment.product
                        .availableQuantity
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="Enter quantity"
                  required
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Reason
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value,
                    )
                  }
                  placeholder={
                    adjustment.type ===
                    'increase'
                      ? 'Example: New stock received'
                      : 'Example: Damaged item'
                  }
                  rows={3}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={
                    closeAdjustment
                  }
                  disabled={saving}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="size-4 animate-spin" />
                  )}

                  {saving
                    ? 'Saving...'
                    : adjustment.type ===
                        'increase'
                      ? 'Add Stock'
                      : 'Remove Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <Icon className="size-5 text-muted-foreground" />
      </div>

      <p className="mt-3 text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function StockBadge({
  status,
}: {
  status: SellerInventoryItem['status'];
}) {
  const config = {
    in_stock: {
      label: 'In stock',
      className:
        'bg-success/10 text-success',
    },

    low_stock: {
      label: 'Low stock',
      className:
        'bg-amber-500/10 text-amber-600',
    },

    out_of_stock: {
      label: 'Out of stock',
      className:
        'bg-destructive/10 text-destructive',
    },
  };

  const item =
    config[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}
