'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SellerOrder } from '@/features/sellers/types/order';

export default function MockPaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('socio-user-token') : null;
  useEffect(() => {
    const currentToken = localStorage.getItem('socio-user-token');
    const requestHeaders = currentToken ? { 'x-user-token': currentToken } : undefined;
    fetch(`/api/orders/${orderId}`, { headers: requestHeaders })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrder(data.order);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Unable to load order.'),
      );
  }, [orderId, token]);

  async function simulate(success: boolean) {
    setLoading(true);
    setMessage('');
    const response = await fetch(`/api/orders/${orderId}/payment/${success ? 'confirm' : 'fail'}`, {
      method: 'POST',
      headers: {
        ...(token ? { 'x-user-token': token } : {}),
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.message ?? 'Unable to process demo payment.');
      return;
    }
    if (success) router.push(`/order-success/${orderId}`);
    else setMessage('Payment failed. You can safely try again.');
  }

  if (!order && !message)
    return <main className="mx-auto max-w-xl px-4 py-12">Loading demo payment...</main>;
  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">Demo payment</p>
        <h1 className="mt-2 text-3xl font-bold">Mock payment</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No money moves. This page simulates a provider for development only.
        </p>
      </div>
      {order && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex justify-between">
            <span>Order</span>
            <strong>{order.orderNumber}</strong>
          </div>
          <div className="mt-3 flex justify-between">
            <span>Amount</span>
            <strong>NPR {order.pricing.total.toLocaleString()}</strong>
          </div>
          <div className="mt-3 flex justify-between">
            <span>Method</span>
            <strong>{order.payment.method.replaceAll('_', ' ')}</strong>
          </div>
          <div className="mt-3 flex justify-between">
            <span>Status</span>
            <strong>{order.payment.status}</strong>
          </div>
          {message && <p className="mt-5 text-sm text-destructive">{message}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              disabled={loading || order.payment.status === 'paid'}
              onClick={() => simulate(true)}
            >
              Pay successfully
            </Button>
            <Button
              variant="outline"
              disabled={loading || order.payment.status === 'paid'}
              onClick={() => simulate(false)}
            >
              Simulate failure
            </Button>
          </div>
          <Link
            className="mt-5 block text-center text-sm text-muted-foreground underline"
            href={`/order-success/${order.id}`}
          >
            Back to order
          </Link>
        </section>
      )}
    </main>
  );
}
