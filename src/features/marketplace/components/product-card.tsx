'use client';

import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './use-cart';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: MarketplaceDetailProduct }) {
  const { add } = useCart();
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const price = product.pricing.salePrice || product.pricing.regularPrice;
  const unavailable = product.inventory.availableQuantity < 1;

  const image =
    product.images[imageIndex] || '/images/product-placeholder.svg';

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

  function handleImageError() {
    if (imageIndex < product.images.length - 1) {
      setImageIndex((current) => current + 1);
    } else {
      setImageIndex(product.images.length);
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center bg-muted/40 p-6 transition group-hover:bg-muted/60">
          <img
            src={image}
            alt={product.name}
            onError={handleImageError}
            className="max-h-full w-full object-contain"
          />
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs font-medium text-primary">
            {product.categoryName}
          </p>

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
              <Star className="size-3.5 fill-current text-amber-500" />
              {product.rating.average}
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-auto px-4 pb-4">
        <Button
          className="w-full"
          disabled={unavailable || adding}
          onClick={handleAdd}
        >
          <ShoppingBag />
          {unavailable
            ? 'Out of stock'
            : adding
              ? 'Adding...'
              : 'Add to cart'}
        </Button>
      </div>
    </article>
  );
}
