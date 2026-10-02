'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';

export const CART_STORAGE_KEY = 'socio-commerce-cart-v1';

export interface CartIntent {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
}

export interface CartDisplayItem extends CartIntent {
  name: string;
  slug?: string;
  images?: string[];
  price: number;
  currency?: string;
  subtotal: number;
  availableQuantity: number;
  unavailable: boolean;
}

export interface CartView {
  items: CartDisplayItem[];
  subtotal: number;
}

function emptyCart(): CartView {
  return { items: [], subtotal: 0 };
}

function readStoredCart(): CartDisplayItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartDisplayItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartDisplayItem).productId === 'string' &&
        Number.isInteger((item as CartDisplayItem).quantity) &&
        (item as CartDisplayItem).quantity >= 1,
    );
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function saveItems(items: CartDisplayItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function summarize(items: CartDisplayItem[]): CartView {
  return { items, subtotal: items.reduce((sum, item) => sum + item.subtotal, 0) };
}

export function useCart() {
  const [cart, setCart] = useState<CartView>(emptyCart);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setCart(summarize(readStoredCart()));
    setError('');
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const mutate = useCallback((action: 'add' | 'update' | 'remove', item: CartDisplayItem) => {
    setError('');
    const items = readStoredCart();
    const index = items.findIndex(
      (candidate) =>
        candidate.productId === item.productId &&
        candidate.selectedVariantId === item.selectedVariantId,
    );
    if (action === 'remove') {
      if (index >= 0) items.splice(index, 1);
    } else if (index >= 0) {
      items[index] = {
        ...items[index],
        ...item,
        quantity: action === 'add' ? items[index].quantity + item.quantity : item.quantity,
        subtotal:
          (action === 'add' ? items[index].quantity + item.quantity : item.quantity) * item.price,
      };
    } else {
      items.push({ ...item, subtotal: item.quantity * item.price });
    }
    saveItems(items);
    const next = summarize(items);
    setCart(next);
    return next;
  }, []);

  const add = useCallback((item: CartDisplayItem) => mutate('add', item), [mutate]);
  const update = useCallback(
    (item: CartDisplayItem, quantity: number) => mutate('update', { ...item, quantity }),
    [mutate],
  );
  const remove = useCallback((item: CartDisplayItem) => mutate('remove', item), [mutate]);
  const clear = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(CART_STORAGE_KEY);
    setCart(emptyCart());
  }, []);

  return { cart, error, refresh, add, update, remove, clear };
}
