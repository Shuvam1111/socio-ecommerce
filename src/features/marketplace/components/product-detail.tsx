'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from './use-cart';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';
export function ProductDetail({ product }: { product: MarketplaceDetailProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    product.images[0] || '/images/product-placeholder.png',
  );
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const { add, error } = useCart();

  async function handleAdd() {
    if (!localStorage.getItem('socio-user-token')) {
      router.push(`/user/login?next=/products/${product.slug}`);
      return;
    }
    try {
      setAdding(true);
      add({
        productId: product.id,
        quantity,
        selectedVariantId: variantId,
        name: product.name,
        slug: product.slug,
        images: product.images,
        price,
        currency: product.pricing.currency,
        subtotal: price * quantity,
        availableQuantity: available,
        unavailable: false,
      });
      toast.success('Added to cart');
    } catch {
      toast.error('Unable to add this product to cart.');
    } finally {
      setAdding(false);
    }
  }
  const variant = product.variants.find((item) => item.id === variantId);
  const available = variant?.quantity ?? product.inventory.availableQuantity;
  const price = variant?.price ?? product.pricing.salePrice;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/marketplace"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to marketplace
      </Link>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-8">
          <div className="flex aspect-square items-center justify-center">
            <img
              src={selectedImage}
              alt={product.name}
              onError={(event) => {
                event.currentTarget.src = '/images/product-placeholder.png';
                setSelectedImage('/images/product-placeholder.png');
              }}
              className="max-h-full w-full object-contain"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`size-16 shrink-0 rounded-lg border p-1 ${selectedImage === image ? 'border-primary' : 'border-border'}`}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.src = '/images/product-placeholder.png';
                    }}
                    className="size-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <section>
          <p className="text-sm font-medium text-primary">
            {product.categoryName}
            {product.subcategoryName ? ` / ${product.subcategoryName}` : ''}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {product.brand}
            {product.model ? ` · ${product.model}` : ''}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold">
              {product.pricing.currency} {price.toLocaleString()}
            </span>
            {product.pricing.regularPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {product.pricing.regularPrice.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-current text-amber-500" /> {product.rating.average} (
              {product.rating.count})
            </span>
          </div>
          <p className="mt-5 text-muted-foreground">
            {product.shortDescription || product.description}
          </p>
          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Choose an option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((item) => (
                  <Button
                    key={item.id}
                    variant={variantId === item.id ? 'default' : 'outline'}
                    onClick={() => {
                      setVariantId(item.id);
                      setQuantity(1);
                    }}
                  >
                    {Object.values(item.attributes).join(' / ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center gap-3">
            <label htmlFor="quantity" className="text-sm font-semibold">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={available}
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.min(available, Math.max(1, Number(event.target.value) || 1)))
              }
              className="h-9 w-20 rounded-lg border border-border bg-background px-3"
            />
            <span className="text-sm text-muted-foreground">
              {available > 0 ? `${available} available` : 'Out of stock'}
            </span>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <Button
            className="mt-6 w-full sm:w-auto"
            disabled={available < 1 || adding}
            onClick={handleAdd}
          >
            <ShoppingBag /> {adding ? 'Adding...' : 'Add to cart'}
          </Button>
          <div className="mt-8 grid gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
            <p>
              {product.shipping.freeShipping
                ? 'Free shipping'
                : `Shipping from ${product.shipping.shippingFee} ${product.pricing.currency}`}{' '}
              · Estimated delivery {product.shipping.estimatedDeliveryDays} days
            </p>
            <p>
              {product.returnPolicy.returnable
                ? `Returns accepted within ${product.returnPolicy.returnDays} days`
                : 'Final sale'}
            </p>
          </div>
        </section>
      </div>
      <div className="mt-12 grid gap-8 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
        <div>
          <h2 className="font-semibold">About this product</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {product.description}
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Product details</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                <dt className="capitalize text-muted-foreground">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </main>
  );
}
