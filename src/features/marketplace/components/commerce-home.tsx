'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Search, ShieldCheck, Store, Truck } from 'lucide-react';
import { ProductCard } from './product-card';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';

type Category = { id: string; name: string; slug: string; icon?: string };

export function CommerceHome({
  categories,
  buyerOnly = false,
}: {
  categories: Category[];
  buyerOnly?: boolean;
}) {
  const [products, setProducts] = useState<MarketplaceDetailProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    fetch('/api/marketplace/products?page=1&limit=8&sort=rating')
      .then((response) => response.json())
      .then((result) => setProducts(result.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = localStorage.getItem('socio-user');
      if (stored) {
        try {
          setFirstName(JSON.parse(stored).firstName ?? '');
        } catch {
          setFirstName('');
        }
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const featured = useMemo(() => products.slice(0, 4), [products]);
  const popular = useMemo(() => products.slice(4, 8), [products]);

  return (
    <div className="bg-background">
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-5 pt-5 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:pb-16 lg:pt-12 lg:px-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:mb-5">
            <ShieldCheck className="size-3.5" /> Trusted local sellers
          </div>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {buyerOnly && firstName
              ? `Hi ${firstName}, find your next favorite.`
              : 'Discover products you will love.'}
          </h1>
          <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:line-clamp-none sm:text-lg sm:leading-7">
            Shop quality products from trusted sellers, all in one place. Browse, compare, and
            checkout with confidence.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Shop now <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#categories"
              className="hidden items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-secondary sm:inline-flex"
            >
              Explore categories
            </Link>
          </div>
          <div className="mt-5 hidden max-w-lg grid-cols-3 gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:grid">
            <span className="flex items-center gap-2">
              <Truck className="size-4 text-primary" /> Easy delivery
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Secure checkout
            </span>
            <span className="flex items-center gap-2">
              <Store className="size-4 text-primary" /> Local sellers
            </span>
          </div>
        </div>
        <div className="relative hidden overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:block sm:p-8">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-primary/15 blur-2xl" />
          <div className="relative mx-auto max-w-sm">
            <div className="mb-4 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Trending now</span>
              <span className="rounded-full bg-background/70 px-2 py-1">Fresh picks</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="rounded-2xl border border-border/70 bg-background/80 p-3 transition hover:-translate-y-1"
                >
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-muted/50 p-3">
                    <img
                      src={product.images[0] || '/images/product-placeholder.svg'}
                      alt=""
                      className="max-h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-primary">
                    {product.pricing.currency}{' '}
                    {(product.pricing.salePrice || product.pricing.regularPrice).toLocaleString()}
                  </p>
                </Link>
              ))}
              {!products.length && (
                <div className="col-span-2 aspect-square rounded-2xl bg-background/60" />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="lg:hidden">
        <ProductSection title="Featured products" products={featured} loading={loading} />
      </div>

      <section id="categories" className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Shop by category</h2>
            <Link href="/marketplace" className="text-sm font-semibold text-primary">
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 xl:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/marketplace?categoryId=${category.id}`}
                className="flex min-w-[140px] items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/5 lg:min-w-0"
              >
                <span className="line-clamp-2">{category.name}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="hidden lg:block">
        <ProductSection title="Featured products" products={featured} loading={loading} />
      </div>
      <ProductSection title="Popular with shoppers" products={popular} loading={loading} />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/70">
              Grow with Socio
            </p>
            <h2 className="mt-2 text-2xl font-bold">Have products to sell?</h2>
            <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
              Reach new customers and manage your store with our seller tools.
            </p>
          </div>
          <Link
            href="/register/vendor"
            className="inline-flex items-center gap-2 rounded-xl bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background/90"
          >
            Become a vendor <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProductSection({
  title,
  products,
  loading,
}: {
  title: string;
  products: MarketplaceDetailProduct[];
  loading: boolean;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Curated for you
          </p>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <Link
          href="/marketplace"
          className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex"
        >
          View all <ArrowRight className="size-4" />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          <div className="hidden aspect-[4/5] animate-pulse rounded-2xl bg-secondary lg:block" />
          <div className="hidden aspect-[4/5] animate-pulse rounded-2xl bg-secondary lg:block" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export function HomeSearch() {
  return (
    <form
      action="/marketplace"
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm"
    >
      <Search className="ml-2 size-4 text-muted-foreground" />
      <input
        name="search"
        placeholder="Search products, brands, and more"
        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Search
      </button>
    </form>
  );
}
