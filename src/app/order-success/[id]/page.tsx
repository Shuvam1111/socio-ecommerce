'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SellerOrder } from '@/features/sellers/types/order';

export default function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('socio-user-token');
    fetch(`/api/orders/${id}`, { headers: token ? { 'x-user-token': token } : {} })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrder(data.order);
      })
      .catch((reason) => setMessage(reason instanceof Error ? reason.message : 'Order not found.'));
  }, [id]);

  if (message)
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Order unavailable</h1>
        <p className="mt-3 text-destructive">{message}</p>
        <Button asChild className="mt-6">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </main>
    );
  if (!order)
    return <main className="mx-auto max-w-2xl px-4 py-16 text-center">Loading order...</main>;
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        ✓
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        Order received
      </p>
      <h1 className="mt-2 text-3xl font-bold">Thank you for your order</h1>
      <p className="mt-3 text-muted-foreground">
        Order {order.orderNumber} is{' '}
        {order.payment.status === 'paid'
          ? 'paid and awaiting seller processing.'
          : order.payment.status === 'failed'
            ? 'awaiting a payment retry.'
            : 'pending payment confirmation.'}
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
        <div className="flex justify-between">
          <span>Status</span>
          <strong>{order.status.replaceAll('_', ' ')}</strong>
        </div>
        <div className="mt-3 flex justify-between">
          <span>Total</span>
          <strong>{order.pricing.total.toLocaleString()}</strong>
        </div>
        <div className="mt-3 flex justify-between">
          <span>Payment</span>
          <strong>
            {order.payment.method.replaceAll('_', ' ')} · {order.payment.status}
          </strong>
        </div>
      </div>
      {order.payment.status !== 'paid' && order.payment.method === 'online' && (
        <Button asChild className="mt-6 w-full sm:w-auto">
          <Link href={`/payment/${order.id}`}>Continue to demo payment</Link>
        </Button>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href={`/orders/${order.id}`}>View order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/marketplace">Continue shopping</Link>
        </Button>
      </div>
    </main>
  );
}
