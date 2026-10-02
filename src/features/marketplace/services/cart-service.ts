import { promises as fs } from 'fs';
import path from 'path';
import type { SellerProduct } from '@/features/sellers/types/product';
import {
  getAvailableQuantity,
  getCurrentPrice,
  loadMarketplaceProducts,
} from './marketplace-service';

export interface CartItem {
  productId: string;
  quantity: number;
  selectedVariantId: string | null;
}
export interface StoredCart {
  id: string;
  items: CartItem[];
  updatedAt: string;
  ownerId?: string;
}

export class CartAccessError extends Error {
  status = 404;
}
interface CartsData {
  carts: StoredCart[];
}
const cartPath = () => path.join(process.cwd(), 'src', 'data', 'carts.json');
async function readCarts() {
  try {
    return JSON.parse(await fs.readFile(cartPath(), 'utf8')) as CartsData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { carts: [] };
    throw error;
  }
}
async function writeCarts(data: CartsData) {
  const target = cartPath();
  const temp = `${target}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2));
  await fs.rename(temp, target);
}
export function validateCartQuantity(quantity: unknown) {
  return typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 1;
}
async function hydrate(items: CartItem[], products: SellerProduct[]) {
  return items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product)
      return {
        ...item,
        unavailable: true,
        name: 'Unavailable product',
        price: 0,
        subtotal: 0,
        availableQuantity: 0,
      };
    const availableQuantity = getAvailableQuantity(product, item.selectedVariantId);
    const price = getCurrentPrice(product, item.selectedVariantId);
    return {
      ...item,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price,
      currency: product.pricing.currency,
      subtotal: price * item.quantity,
      availableQuantity,
      unavailable: item.quantity > availableQuantity,
    };
  });
}
function findOwnedCart(data: CartsData, id: string, ownerId?: string) {
  const cart = data.carts.find((item) => item.id === id);
  if (cart?.ownerId && cart.ownerId !== ownerId) throw new CartAccessError('Cart not found.');
  return cart;
}

export async function getCart(id: string, ownerId?: string) {
  const data = await readCarts();
  let cart = findOwnedCart(data, id, ownerId);
  if (!cart) {
    cart = { id, items: [], updatedAt: new Date().toISOString(), ...(ownerId ? { ownerId } : {}) };
    if (ownerId) {
      data.carts.push(cart);
      await writeCarts(data);
    }
  } else if (ownerId && !cart.ownerId) {
    cart.ownerId = ownerId;
    cart.updatedAt = new Date().toISOString();
    await writeCarts(data);
  }
  const products = await loadMarketplaceProducts();
  const items = await hydrate(cart.items, products);
  return { ...cart, items, subtotal: items.reduce((sum, item) => sum + item.subtotal, 0) };
}
export async function clearCart(id: string, ownerId?: string) {
  const data = await readCarts();
  findOwnedCart(data, id, ownerId);
  data.carts = data.carts.filter((cart) => cart.id !== id);
  await writeCarts(data);
}

export async function mutateCart(
  id: string,
  mutation: {
    ownerId?: string;
    action: 'add' | 'update' | 'remove';
    productId?: string;
    quantity?: number;
    selectedVariantId?: string | null;
  },
) {
  const data = await readCarts();
  const ownerId = mutation.ownerId;
  let cart = findOwnedCart(data, id, ownerId);
  if (!cart) {
    cart = { id, items: [], updatedAt: new Date().toISOString(), ...(ownerId ? { ownerId } : {}) };
  }
  const products = await loadMarketplaceProducts();
  const product = mutation.productId
    ? products.find((item) => item.id === mutation.productId)
    : null;
  if (mutation.action !== 'remove' && (!product || !validateCartQuantity(mutation.quantity)))
    throw new Error('Valid product and whole-number quantity are required.');
  if (mutation.action !== 'remove' && product) {
    const variantId = mutation.selectedVariantId ?? null;
    if (variantId && !product.variants.some((variant) => variant.id === variantId))
      throw new Error('Selected variant is invalid.');
    const existing = cart.items.find(
      (item) => item.productId === product.id && item.selectedVariantId === variantId,
    );
    const nextQuantity =
      mutation.action === 'add'
        ? (existing?.quantity ?? 0) + (mutation.quantity as number)
        : (mutation.quantity as number);
    if (nextQuantity > getAvailableQuantity(product, variantId))
      throw new Error('Requested quantity exceeds available stock.');
    if (existing) existing.quantity = nextQuantity;
    else
      cart.items.push({
        productId: product.id,
        quantity: nextQuantity,
        selectedVariantId: variantId,
      });
  } else if (mutation.action === 'remove' && mutation.productId) {
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId === mutation.productId &&
          item.selectedVariantId === (mutation.selectedVariantId ?? null)
        ),
    );
  }
  cart.updatedAt = new Date().toISOString();
  const index = data.carts.findIndex((item) => item.id === id);
  if (index >= 0) data.carts[index] = cart;
  else data.carts.push(cart);
  await writeCarts(data);
  return getCart(id, ownerId);
}
