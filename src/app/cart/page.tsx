'use client';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/features/marketplace/components/use-cart';
export default function CartPage() {
  const { cart, error, update, remove } = useCart();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Your selections
          </p>
          <h1 className="mt-2 text-3xl font-bold">Cart</h1>
        </div>
        <Link href="/marketplace" className="text-sm text-primary hover:underline">
          Continue shopping
        </Link>
      </div>
      {error && (
        <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}
      {cart.items.length ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <article
                key={`${item.productId}-${item.selectedVariantId}`}
                className="flex gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-muted/50 p-3">
                  <img
                    src={item.images?.[0] || '/images/product-placeholder.svg'}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  {item.unavailable && (
                    <p className="mt-1 text-sm text-destructive">
                      This item is unavailable or exceeds current stock.
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.currency} {item.price.toLocaleString()} each
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={item.quantity <= 1}
                      onClick={() => update(item, item.quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={item.quantity >= item.availableQuantity}
                      onClick={() => update(item, item.quantity + 1)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="ml-2 text-destructive"
                      onClick={() => remove(item)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <p className="font-semibold">
                  {item.currency} {item.subtotal.toLocaleString()}
                </p>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Order summary</h2>
            <div className="mt-5 flex justify-between border-t border-border pt-4">
              <span className="text-muted-foreground">Subtotal</span>
              <strong>{cart.subtotal.toLocaleString()}</strong>
            </div>
            <Button asChild className="mt-5 w-full">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Prices and stock are checked again when you place the order.
            </p>
          </aside>
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find something you like in the marketplace.
          </p>
          <Button asChild className="mt-5">
            <Link href="/marketplace">Browse products</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
