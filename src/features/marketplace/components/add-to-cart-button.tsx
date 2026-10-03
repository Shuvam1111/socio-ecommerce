'use client';
import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const ADDED_FEEDBACK_MS = 1800;

interface AddToCartButtonProps {
  onAdd: () => boolean;
  disabled?: boolean;
  outOfStock?: boolean;
  inCartQuantity?: number;
  className?: string;
}

export function AddToCartButton({
  onAdd,
  disabled = false,
  outOfStock = false,
  inCartQuantity = 0,
  className,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const [burst, setBurst] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleClick() {
    if (!onAdd()) return;
    setAdded(true);
    setBurst((value) => value + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || outOfStock}
      aria-live="polite"
      className={cn(
        'relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-md px-4 text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        added
          ? 'bg-success text-success-foreground shadow-[0_0_0_4px] shadow-success/20'
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        className,
      )}
    >
      {added && (
        <span
          key={burst}
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-cart-sweep bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}
      {outOfStock ? (
        <>
          <ShoppingBag className="size-4" />
          Out of stock
        </>
      ) : added ? (
        <span key={`added-${burst}`} className="flex items-center gap-2">
          <span className="flex size-5 animate-cart-pop items-center justify-center rounded-full bg-success-foreground text-success">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            Added to cart
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-2 animate-in fade-in duration-200">
          <ShoppingBag className="size-4" />
          Add to cart
          {inCartQuantity > 0 && (
            <span className="rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-[11px] font-semibold leading-none">
              {inCartQuantity} in cart
            </span>
          )}
        </span>
      )}
    </button>
  );
}
