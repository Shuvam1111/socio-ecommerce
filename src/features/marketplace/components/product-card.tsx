'use client';

/**
 * =====================================================================
 * PRODUCT CARD  (redesigned UI, same API as the MVP)
 * =====================================================================
 * NOTES FOR ANOTHER AI / DEVELOPER:
 *   1. Export name, props ({ product }), cart logic, login redirect, toasts and the
 *      image-fallback behavior are UNCHANGED, so every page using <ProductCard />
 *      keeps working. Only the visual design changed.
 *   2. The card is height-flexible (`h-full`) and works in any grid. It does not set its own width.
 *   3. Add to cart: on phones it is a round icon button on the price row (saves height in
 *      2-column grids). From `sm` up it is the full-width button under the details.
 *      Both call the same handleAdd().
 *   4. Sale UI appears only when salePrice < regularPrice (strike-through + "-%" badge).
 *   5. Colors use theme tokens only. Search for "CHANGE HERE" for tweakable values.
 */

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './use-cart';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// CHANGE HERE: show the "Only N left" badge when stock is at or below this number.
const LOW_STOCK_THRESHOLD = 5;

export function ProductCard({ product }: { product: MarketplaceDetailProduct }) {
  const { add } = useCart();
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [hoverImageFailed, setHoverImageFailed] = useState(false);

  const { regularPrice, salePrice, currency } = product.pricing;
  const price = salePrice || regularPrice; // same rule as the MVP
  const onSale = Boolean(salePrice) && Number(salePrice) < Number(regularPrice);
  const percentOff = onSale
    ? Math.round((1 - Number(salePrice) / Number(regularPrice)) * 100)
    : 0;

  const available = product.inventory.availableQuantity;
  const unavailable = available < 1;
  const lowStock = !unavailable && available <= LOW_STOCK_THRESHOLD;

  const ratingValue = Number(product.rating.average) || 0;

  const image = product.images[imageIndex] || '/images/product-placeholder.svg';
  // Second photo crossfades in on hover (mouse devices only). Skipped when the first photo failed.
  const hoverImage =
    !unavailable && imageIndex === 0 && !hoverImageFailed ? product.images[1] : undefined;

  async function handleAdd() {
    if (!localStorage.getItem('socio-user-token')) {
      router.push(`/user/login?next=/products/${product.slug}`);
      return;
    }

    try {
      setAdding(true);

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
      });
    } catch {
      toast.error('Unable to add this product to cart.');
    } finally {
      setAdding(false);
    }
  }

  // Try the next image if one fails, then fall back to the placeholder.
  function handleImageError() {
    if (imageIndex < product.images.length - 1) {
      setImageIndex((current) => current + 1);
    } else {
      setImageIndex(product.images.length);
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        {/* Image tile: square, image fills it with object-contain (no cropping, no overflow) */}
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            className={`absolute inset-0 size-full object-contain p-3 mix-blend-multiply transition duration-500 group-hover:scale-105 dark:mix-blend-normal sm:p-5 ${
              hoverImage ? 'group-hover:opacity-0' : ''
            } ${unavailable ? 'opacity-50 grayscale' : ''}`}
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              onError={() => setHoverImageFailed(true)}
              className="absolute inset-0 hidden size-full object-contain p-3 opacity-0 mix-blend-multiply transition duration-500 group-hover:scale-105 group-hover:opacity-100 dark:mix-blend-normal sm:p-5 [@media(hover:hover)]:block"
            />
          )}

          {/* Discount: one capsule, top-left. */}
          {onSale && percentOff > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-destructive px-2 py-1 text-[10px] font-bold leading-none text-destructive-foreground sm:left-3 sm:top-3 sm:text-xs">
              -{percentOff}%
            </span>
          )}

          {/* Low stock: slim strip along the bottom of the image, so it never stacks under the discount. */}
          {lowStock && (
            <div className="absolute inset-x-0 bottom-0 bg-warning/90 px-2 py-1 text-center text-[10px] font-semibold text-warning-foreground backdrop-blur-sm sm:text-xs">
              Only {available} left
            </div>
          )}

          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-foreground/85 px-3 py-1.5 text-xs font-semibold text-background">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
          <p className="min-h-4 truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
            {product.brand}
          </p>

          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-card-foreground transition-colors group-hover:text-primary sm:text-[15px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-xs">
            {ratingValue > 0 ? (
              <>
                <Star className="size-3.5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{ratingValue.toFixed(1)}</span>
              </>
            ) : (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                New
              </span>
            )}
          </div>

          {/* Price (right padding on phones leaves room for the round add-to-cart button) */}
          <div className="mt-auto pr-12 pt-1 sm:pr-0">
            {onSale && (
              <p className="text-xs text-muted-foreground line-through">
                {currency} {Number(regularPrice).toLocaleString()}
              </p>
            )}
            <p className="flex flex-wrap items-baseline gap-x-1 font-bold text-foreground">
              <span className="text-[11px] font-semibold text-muted-foreground sm:text-xs">
                {currency}
              </span>
              <span className="text-base sm:text-lg">{price.toLocaleString()}</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Phones: round icon button, sits on the price row. Outside the <Link> (valid HTML). */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={unavailable || adding}
        aria-label={unavailable ? 'Out of stock' : `Add ${product.name} to cart`}
        className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition active:scale-95 disabled:opacity-40 sm:hidden"
      >
        <ShoppingBag className={`size-[18px] ${adding ? 'animate-pulse' : ''}`} />
      </button>

      {/* sm and up: full-width button, same as the MVP */}
      <div className="hidden px-4 pb-4 sm:block">
        <Button className="w-full" disabled={unavailable || adding} onClick={handleAdd}>
          <ShoppingBag />
          {unavailable ? 'Out of stock' : adding ? 'Adding...' : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
}
