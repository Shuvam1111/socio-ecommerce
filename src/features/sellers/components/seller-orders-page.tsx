'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Package, Clock, Truck, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import {
  getSellerOrders,
  verifySellerOrder,
  markSellerPaymentReceived,
  deliverSellerOrder,
  markSellerOrderDelivered,
  refundSellerOrder,
} from '../services/seller-order-service';

import type { OrderStatus, SellerOrder } from '../types/order';
import { SellerPagination } from './seller-pagination';

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  paid: 'Paid',
  processing: 'Processing',
  ready_to_deliver: 'Ready to Deliver',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refund_requested: 'Refund Requested',
  refunded: 'Refunded',
};

const statusClasses: Record<OrderStatus, string> = {
  pending_payment: 'bg-muted text-muted-foreground',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  ready_to_deliver: 'bg-orange-100 text-orange-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refund_requested: 'bg-pink-100 text-pink-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadOrders() {
    try {
      setLoading(true);

      const result = await getSellerOrders();

      setOrders(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load orders.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredOrders = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.orderNumber.toLowerCase().includes(searchValue) ||
        order.buyerId.toLowerCase().includes(searchValue) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchValue));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice(
    (Math.min(page, pageCount) - 1) * pageSize,
    Math.min(page, pageCount) * pageSize,
  );

  const stats = useMemo(
    () => ({
      all: orders.length,
      paid: orders.filter((order) => order.status === 'paid').length,
      processing: orders.filter(
        (order) => order.status === 'processing' || order.status === 'ready_to_deliver',
      ).length,
      delivery: orders.filter((order) => order.status === 'out_for_delivery').length,
      delivered: orders.filter((order) => order.status === 'delivered').length,
      refunds: orders.filter(
        (order) => order.status === 'refund_requested' || order.status === 'refunded',
      ).length,
    }),
    [orders],
  );

  async function handleAction(
    order: SellerOrder,
    action: 'verify' | 'payment' | 'deliver' | 'delivered' | 'refund',
  ) {
    try {
      setProcessingId(order.id);

      if (action === 'payment') {
        await markSellerPaymentReceived(order.id);
        toast.success(`Payment for ${order.orderNumber} marked as received.`);
      }

      if (action === 'verify') {
        await verifySellerOrder(order.id);
        toast.success(`Order ${order.orderNumber} verified.`);
      }

      if (action === 'deliver') {
        await deliverSellerOrder(
          order.id,
          order.status === 'processing' ? 'ready_to_deliver' : 'out_for_delivery',
        );
        toast.success(`Order ${order.orderNumber} sent for delivery.`);
      }

      if (action === 'delivered') {
        await markSellerOrderDelivered(order.id);
        toast.success(`Order ${order.orderNumber} marked as delivered.`);
      }

      if (action === 'refund') {
        await refundSellerOrder(order.id, 'Refund processed by seller.');

        toast.success(`Refund processed for ${order.orderNumber}.`);
      }

      await loadOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update order.';

      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and manage orders for your store.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="All Orders" value={stats.all} icon={Package} />

        <StatCard label="Paid" value={stats.paid} icon={CheckCircle} />

        <StatCard label="Processing" value={stats.processing} icon={Clock} />

        <StatCard label="Delivery" value={stats.delivery} icon={Truck} />

        <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle} />

        <StatCard label="Refunds" value={stats.refunds} icon={RotateCcw} />
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, buyer or product..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">All Statuses</option>

            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="text-sm text-muted-foreground">Loading orders...</div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <Package className="mb-3 size-10 text-muted-foreground" />

            <h2 className="font-semibold text-foreground">No orders found</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Buyer</th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment</th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>

                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">{order.orderNumber}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {order.shippingAddress.fullName}
                      </p>

                      <p className="text-xs text-muted-foreground">{order.shippingAddress.phone}</p>
                    </td>

                    <td className="max-w-[220px] px-4 py-4">
                      <p className="truncate font-medium text-foreground">
                        {order.items[0]?.name ?? 'No product'}
                      </p>

                      {order.items.length > 1 && (
                        <p className="text-xs text-muted-foreground">
                          +{order.items.length - 1} more item(s)
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 font-semibold text-foreground">
                      Rs. {order.pricing.total.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          order.payment.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.payment.status === 'paid' ? 'Payment Received' : 'Payment Pending'}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.payment.method === 'cash_on_delivery'
                          ? 'Cash on Delivery'
                          : 'Online Payment'}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusClasses[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {order.payment.status === 'pending' && (
                          <ActionButton
                            label="Mark Payment Received"
                            disabled={processingId === order.id}
                            onClick={() => void handleAction(order, 'payment')}
                          />
                        )}

                        {(order.status === 'pending_payment' || order.status === 'paid') && (
                          <ActionButton
                            label="Verify"
                            disabled={processingId === order.id}
                            onClick={() => void handleAction(order, 'verify')}
                          />
                        )}

                        {(order.status === 'processing' || order.status === 'ready_to_deliver') && (
                          <ActionButton
                            label={order.status === 'processing' ? 'Prepare' : 'Send'}
                            disabled={processingId === order.id}
                            onClick={() => void handleAction(order, 'deliver')}
                          />
                        )}

                        {order.status === 'out_for_delivery' && (
                          <ActionButton
                            label="Delivered"
                            disabled={processingId === order.id}
                            onClick={() => void handleAction(order, 'delivered')}
                          />
                        )}

                        {order.status === 'delivered' && (
                          <ActionButton
                            label="Refund"
                            variant="danger"
                            disabled={processingId === order.id}
                            onClick={() => void handleAction(order, 'refund')}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SellerPagination
          page={page}
          pageCount={pageCount}
          total={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        <Icon className="size-4 text-muted-foreground" />
      </div>

      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  variant?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === 'danger'
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {disabled ? 'Updating...' : label}
    </button>
  );
}
