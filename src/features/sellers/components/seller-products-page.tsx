'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  CheckCircle2,
  Edit,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  deleteSellerProduct,
  getSellerProducts,
} from '../services/seller-product-service';

import type { SellerProduct } from '../types/product';

import { SellerProductForm } from './seller-product-form';

interface SellerProductsPageProps {
  onAddProduct?: () => void;
  onEditProduct?: (product: SellerProduct) => void;
}

type StockFilter =
  | 'all'
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock';

function getStockStatus(product: SellerProduct) {
  const {
    availableQuantity,
    lowStockThreshold,
  } = product.inventory;

  if (availableQuantity <= 0) {
    return 'out_of_stock';
  }

  if (availableQuantity <= lowStockThreshold) {
    return 'low_stock';
  }

  return 'in_stock';
}

function getStockLabel(product: SellerProduct) {
  const status = getStockStatus(product);

  if (status === 'out_of_stock') {
    return 'Out of stock';
  }

  if (status === 'low_stock') {
    return 'Low stock';
  }

  return 'In stock';
}

export function SellerProductsPage({
  onAddProduct,
  onEditProduct,
}: SellerProductsPageProps) {
  const [products, setProducts] = useState<
    SellerProduct[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [stockFilter, setStockFilter] =
    useState<StockFilter>('all');

  const [showForm, setShowForm] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<SellerProduct | null>(null);

  async function loadProducts() {
    try {
      setLoading(true);

      const result = await getSellerProducts();

      setProducts(result);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to load products.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleAddProduct() {
    setEditingProduct(null);
    setShowForm(true);

    onAddProduct?.();
  }

  function handleEditProduct(
    product: SellerProduct,
  ) {
    setEditingProduct(product);
    setShowForm(true);

    onEditProduct?.(product);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingProduct(null);

    void loadProducts();
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleDelete(
    product: SellerProduct,
  ) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);

      await deleteSellerProduct(product.id);

      setProducts((current) =>
        current.filter(
          (item) => item.id !== product.id,
        ),
      );

      toast.success(
        'Product deleted successfully.',
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to delete product.',
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name
          .toLowerCase()
          .includes(query) ||
        product.brand
          .toLowerCase()
          .includes(query) ||
        product.model
          .toLowerCase()
          .includes(query) ||
        product.inventory.sku
          .toLowerCase()
          .includes(query) ||
        product.inventory.barcode
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        product.status === statusFilter;

      const matchesStock =
        stockFilter === 'all' ||
        getStockStatus(product) === stockFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [
    products,
    search,
    statusFilter,
    stockFilter,
  ]);

  const stats = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) =>
        sum + product.inventory.quantity,
      0,
    );

    const availableUnits = products.reduce(
      (sum, product) =>
        sum +
        product.inventory.availableQuantity,
      0,
    );

    return {
      total: products.length,

      approved: products.filter(
        (product) =>
          product.status === 'approved',
      ).length,

      pending: products.filter(
        (product) =>
          product.status === 'pending',
      ).length,

      lowStock: products.filter(
        (product) =>
          getStockStatus(product) ===
          'low_stock',
      ).length,

      outOfStock: products.filter(
        (product) =>
          getStockStatus(product) ===
          'out_of_stock',
      ).length,

      totalUnits,
      availableUnits,
    };
  }, [products]);

  /*
   * Show the product form instead of the
   * product table when Add/Edit is selected.
   */
  if (showForm) {
    return (
      <SellerProductForm
        product={editingProduct}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Products
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your products and inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                void loadProducts()
              }
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw
                className={`size-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              <Plus className="size-4" />

              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Products"
            value={stats.total}
            icon={Package}
          />

          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle2}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={RefreshCw}
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            icon={Package}
          />

          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            icon={XCircle}
          />
        </div>

        {/* Inventory summary */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Inventory Summary
              </p>

              <p className="mt-1 text-lg font-semibold text-foreground">
                {stats.availableUnits}{' '}
                available

                <span className="mx-2 text-muted-foreground">
                  /
                </span>

                {stats.totalUnits} total units
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredProducts.length}{' '}
              products shown
            </div>
          </div>
        </div>

        {/* Filters */}
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
                placeholder="Search product, brand, model, SKU or barcode..."
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="all">
                All Status
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="rejected">
                Rejected
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

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

        {/* Products */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <RefreshCw className="size-6 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <Package className="size-10 text-muted-foreground" />

              <h2 className="mt-3 font-semibold text-foreground">
                No products found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or filters.
              </p>

              {products.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  <Plus className="size-4" />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/40 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Product
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      SKU
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Price
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Stock
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sold
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => {
                      const stockStatus =
                        getStockStatus(
                          product,
                        );

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-border last:border-b-0"
                        >
                          {/* Product */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                                {product
                                  .images[0] ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={
                                      product
                                        .images[0]
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <Package className="size-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {product.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {
                                    product.brand
                                  }

                                  {' • '}

                                  {
                                    product.model
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {
                              product
                                .inventory
                                .sku
                            }
                          </td>

                          {/* Price */}
                          <td className="px-5 py-4">
                            <p className="font-medium text-foreground">
                              NPR{' '}
                              {product.pricing.salePrice.toLocaleString()}
                            </p>

                            {product
                              .pricing
                              .regularPrice !==
                              product
                                .pricing
                                .salePrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                NPR{' '}
                                {product.pricing.regularPrice.toLocaleString()}
                              </p>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="px-5 py-4">
                            <p className="font-medium text-foreground">
                              {
                                product
                                  .inventory
                                  .availableQuantity
                              }

                              {' / '}

                              {
                                product
                                  .inventory
                                  .quantity
                              }
                            </p>

                            <p
                              className={`text-xs ${
                                stockStatus ===
                                'out_of_stock'
                                  ? 'text-destructive'
                                  : stockStatus ===
                                      'low_stock'
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                              }`}
                            >
                              {getStockLabel(
                                product,
                              )}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                product.status
                              }
                            />
                          </td>

                          {/* Sold */}
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {
                              product.soldCount
                            }
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditProduct(
                                    product,
                                  )
                                }
                                className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                title="Edit product"
                              >
                                <Edit className="size-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(
                                    product,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                                className="rounded-lg border border-border p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                title="Delete product"
                              >
                                {deletingId ===
                                product.id ? (
                                  <RefreshCw className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
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

function StatusBadge({
  status,
}: {
  status: SellerProduct['status'];
}) {
  const config = {
    approved: {
      label: 'Approved',
      className:
        'bg-success/10 text-success',
    },

    pending: {
      label: 'Pending',
      className:
        'bg-amber-500/10 text-amber-600',
    },

    rejected: {
      label: 'Rejected',
      className:
        'bg-destructive/10 text-destructive',
    },

    inactive: {
      label: 'Inactive',
      className:
        'bg-secondary text-muted-foreground',
    },
  };

  const item = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}
