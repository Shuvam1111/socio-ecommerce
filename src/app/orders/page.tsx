'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SellerOrder } from '@/features/sellers/types/order';
import { OrderItemReview } from '@/features/reviews/components/order-item-review';
export default function OrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const token = localStorage.getItem('socio-user-token');
    fetch('/api/orders', { headers: token ? { 'x-user-token': token } : {} })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrders(data.orders);
      })
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Unable to load orders.'),
      );
  }, []);
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold">Your orders</h1>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      {!orders.length && !error ? (
        <p className="mt-8 text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-border bg-card p-5">
              <Link href={`/orders/${order.id}`} className="block hover:text-primary">
                <div className="flex justify-between gap-4">
                  <strong>{order.orderNumber}</strong>
                  <div className="text-right text-sm capitalize text-muted-foreground">
                    <p>Order: {order.status.replaceAll('_', ' ')}</p>
                    <p>Payment: {order.payment.status}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {order.items.length} item(s) · Total {order.pricing.total.toLocaleString()}
                </p>
              </Link>
              {order.status === 'delivered' && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold">Purchased items</p>
                  <div className="mt-3 grid gap-3">
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.productId}-${item.sku}`}
                        className="rounded-xl border border-border/70 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} · NPR {item.totalPrice.toLocaleString()}
                            </p>
                          </div>
                          <OrderItemReview productId={item.productId} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
