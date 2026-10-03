'use client';
import { useCallback, useSyncExternalStore } from 'react';

export const CART_STORAGE_KEY = 'socio-commerce-cart-v1';
const CART_CHANGE_EVENT = 'socio-cart-change';

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
  count: number;
}

const EMPTY_CART: CartView = { items: [], subtotal: 0, count: 0 };

function parseItems(raw: string | null): CartDisplayItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
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
    return [];
  }
}

function summarize(items: CartDisplayItem[]): CartView {
  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

let cachedRaw: string | null | undefined;
let cachedView: CartView = EMPTY_CART;

// useSyncExternalStore requires a referentially stable snapshot between unchanged reads.
function getSnapshot(): CartView {
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedView = summarize(parseItems(raw));
  }
  return cachedView;
}

function getServerSnapshot(): CartView {
  return EMPTY_CART;
}

function subscribe(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === CART_STORAGE_KEY) onChange();
  };
  window.addEventListener(CART_CHANGE_EVENT, onChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function writeItems(items: CartDisplayItem[]) {
  if (items.length) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  else window.localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const error = '';

  const refresh = useCallback(async () => {
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }, []);

  const mutate = useCallback((action: 'add' | 'update' | 'remove', item: CartDisplayItem) => {
    const items = [...getSnapshot().items];
    const index = items.findIndex(
      (candidate) =>
        candidate.productId === item.productId &&
        candidate.selectedVariantId === item.selectedVariantId,
    );
    if (action === 'remove') {
      if (index >= 0) items.splice(index, 1);
    } else if (index >= 0) {
      const quantity = action === 'add' ? items[index].quantity + item.quantity : item.quantity;
      items[index] = { ...items[index], ...item, quantity, subtotal: quantity * item.price };
    } else {
      items.push({ ...item, subtotal: item.quantity * item.price });
    }
    writeItems(items);
    return getSnapshot();
  }, []);

  const add = useCallback((item: CartDisplayItem) => mutate('add', item), [mutate]);
  const update = useCallback(
    (item: CartDisplayItem, quantity: number) => mutate('update', { ...item, quantity }),
    [mutate],
  );
  const remove = useCallback((item: CartDisplayItem) => mutate('remove', item), [mutate]);
  const clear = useCallback(() => writeItems([]), []);

  return { cart, error, refresh, add, update, remove, clear };
}
