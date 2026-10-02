'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { SellerOrder } from '@/features/sellers/types/order';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('socio-user-token');
    fetch(`/api/orders/${orderId}`, { headers: token ? { 'x-user-token': token } : {} })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrder(data.order);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Order not found.'));
  }, [orderId]);

  if (error)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Order unavailable</h1>
        <p className="mt-3 text-destructive">{error}</p>
      </main>
    );
  if (!order)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-muted-foreground">Loading order...</main>
    );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/orders" className="text-sm text-primary hover:underline">
        Back to orders
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
          <h1 className="mt-1 text-3xl font-bold">Order details</h1>
        </div>
        <div className="space-y-1 text-right text-sm capitalize">
          <p className="rounded-full bg-primary/10 px-3 py-1 text-primary">
            Order: {order.status.replaceAll('_', ' ')}
          </p>
          <p className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800">
            Payment: {order.payment.status}
          </p>
        </div>
      </div>
      <section className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-5">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.sku}`}
            className="flex justify-between gap-4 border-b border-border pb-3 text-sm last:border-0 last:pb-0"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{item.totalPrice.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-4 font-semibold">
          <span>Total</span>
          <span>{order.pricing.total.toLocaleString()}</span>
        </div>
      </section>
      <section className="mt-5 rounded-2xl border border-border bg-card p-5 text-sm">
        <p>
          Payment method:{' '}
          <span className="capitalize">{order.payment.method.replaceAll('_', ' ')}</span>
          <br />
          Payment status: <span className="capitalize">{order.payment.status}</span>
        </p>
        <p className="mt-2 text-muted-foreground">
          Shipping: {order.shippingAddress.city}, {order.shippingAddress.district}
        </p>
      </section>
    </main>
  );
}
