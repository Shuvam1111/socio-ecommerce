'use client';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useCart } from './use-cart';
import { AddToCartButton } from './add-to-cart-button';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: MarketplaceDetailProduct }) {
  const { add, cart } = useCart();
  const router = useRouter();
  const price = product.pricing.salePrice || product.pricing.regularPrice;
  const unavailable = product.inventory.availableQuantity < 1;
  const inCartQuantity = cart.items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  function handleAdd() {
    if (!localStorage.getItem('socio-user-token')) {
      router.push(`/user/login?next=/products/${product.slug}`);
      return false;
    }
    try {
      add({
        productId: product.id,
        quantity: 1,
        selectedVariantId: null,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price,
        currency: product.pricing.currency,
        subtotal: price,
        availableQuantity: product.inventory.availableQuantity,
        unavailable: false,
      });
      toast.success('Added to cart', {
        description: product.name,
        action: { label: 'View cart', onClick: () => router.push('/cart') },
      });
      return true;
    } catch {
      toast.error('Unable to add this product to cart.');
      return false;
    }
  }
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center bg-muted/50 p-6">
          <img
            src={product.images[0] || '/images/product-placeholder.svg'}
            alt=""
            className="max-h-full w-full object-contain"
          />
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs font-medium text-primary">{product.categoryName}</p>
          <h2 className="line-clamp-2 font-semibold text-card-foreground group-hover:text-primary">
            {product.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {product.brand}
            {product.model ? ` · ${product.model}` : ''}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-lg font-bold text-foreground">
              {product.pricing.currency} {price.toLocaleString()}
            </p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 fill-current text-amber-500" /> {product.rating.average}
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <AddToCartButton
          className="w-full"
          onAdd={handleAdd}
          outOfStock={unavailable}
          inCartQuantity={inCartQuantity}
        />
      </div>
    </article>
  );
}
