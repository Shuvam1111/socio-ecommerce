'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/features/marketplace/components/use-cart';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, error, clear } = useCart();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    city: '',
    street: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash_on_delivery'>(
    'cash_on_delivery',
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('socio-user-token')
            ? { 'x-user-token': localStorage.getItem('socio-user-token')! }
            : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          shippingAddress: form,
          paymentMethod,
          items: cart.items.map(({ productId, quantity, selectedVariantId }) => ({
            productId,
            quantity,
            selectedVariantId,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      clear();
      router.push(`/order-success/${data.order.id}`);
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  }
  if (!cart.items.length)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-4 text-muted-foreground">Your cart is empty.</p>
      </main>
    );
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Secure order setup
        </p>
        <h1 className="mt-2 text-3xl font-bold">Checkout</h1>
      </div>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Shipping information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {(
              ['fullName', 'phone', 'province', 'district', 'city', 'street', 'postalCode'] as const
            ).map((key) => (
              <div key={key} className={key === 'street' ? 'sm:col-span-2' : ''}>
                <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1')}</Label>
                <Input
                  id={key}
                  required
                  value={form[key]}
                  onChange={(event) => update(key, event.target.value)}
                  className="mt-2"
                />
              </div>
            ))}
          </div>
          <h2 className="mt-8 text-lg font-semibold">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="rounded-xl border border-border p-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cash_on_delivery'}
                onChange={() => setPaymentMethod('cash_on_delivery')}
              />{' '}
              <span className="ml-2 font-medium">Cash on delivery</span>
            </label>
            <label className="rounded-xl border border-border p-4">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />{' '}
              <span className="ml-2 font-medium">Online payment</span>
            </label>
          </div>
          {(message || error) && (
            <p className="mt-5 text-sm text-destructive">{message || error}</p>
          )}
        </section>
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 space-y-3">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedVariantId}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-border pt-4">
            <span className="text-muted-foreground">Total</span>
            <strong>{cart.subtotal.toLocaleString()}</strong>
          </div>
          <Button
            className="mt-5 w-full"
            disabled={loading || cart.items.some((item) => item.unavailable)}
          >
            {loading ? 'Placing order...' : 'Place order'}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Shipping is currently free. Payment remains pending until confirmed.
          </p>
        </aside>
      </form>
    </main>
  );
}
