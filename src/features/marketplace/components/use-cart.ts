'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

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

let currentCart = emptyCart();
const listeners = new Set<() => void>();

function getCartSnapshot() {
  return currentCart;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(items: CartDisplayItem[]) {
  currentCart = summarize(items);
  listeners.forEach((listener) => listener());
}

function loadStoredCart() {
  if (typeof window !== 'undefined') publish(readStoredCart());
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getCartSnapshot, emptyCart);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStoredCart();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) loadStoredCart();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refresh = useCallback(async () => {
    loadStoredCart();
    setError('');
  }, []);

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
    publish(items);
    return currentCart;
  }, []);

  const add = useCallback((item: CartDisplayItem) => mutate('add', item), [mutate]);
  const update = useCallback(
    (item: CartDisplayItem, quantity: number) => mutate('update', { ...item, quantity }),
    [mutate],
  );
  const remove = useCallback((item: CartDisplayItem) => mutate('remove', item), [mutate]);
  const clear = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(CART_STORAGE_KEY);
    publish([]);
  }, []);

  return { cart, error, refresh, add, update, remove, clear };
}
