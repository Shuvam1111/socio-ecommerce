'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from './product-card';
import type { MarketplaceDetailProduct } from '../services/marketplace-service';

type Option = { id: string; name: string; status: string; categoryId?: string };
export function MarketplaceBrowser({
  categories,
  subcategories,
}: {
  categories: Option[];
  subcategories: Option[];
}) {
  const [products, setProducts] = useState<MarketplaceDetailProduct[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [sort, setSort] = useState('relevance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const visibleSubs = subcategories.filter((item) => !categoryId || item.categoryId === categoryId);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: '12', sort });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    if (subcategoryId) params.set('subcategoryId', subcategoryId);
    fetch(`/api/marketplace/products?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setProducts(result.products);
        setPagination(result.pagination);
      })
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError('Unable to load products.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, categoryId, subcategoryId, sort, pagination.page]);
  /* eslint-enable react-hooks/set-state-in-effect */
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Discover something useful
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Marketplace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse approved products from Socio Commerce sellers.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cart">View cart</Link>
        </Button>
      </div>
      <section
        aria-label="Product filters"
        className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products, brands, models..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
          </div>
          <select
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubcategoryId('');
              setPagination((current) => ({ ...current, page: 1 }));
            }}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
            value={subcategoryId}
            onChange={(event) => {
              setSubcategoryId(event.target.value);
              setPagination((current) => ({ ...current, page: 1 }));
            }}
          >
            <option value="">All subcategories</option>
            {visibleSubs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
            <option value="sold">Most sold</option>
          </select>
        </div>
      </section>
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <SlidersHorizontal className="mx-auto mb-3 size-6 animate-pulse" />
          Loading products...
        </div>
      ) : products.length ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
          <h2 className="font-semibold">No products found</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try changing your search or filters.</p>
        </div>
      )}
    </main>
  );
}
