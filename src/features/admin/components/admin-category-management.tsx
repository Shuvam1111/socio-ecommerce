'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AdminPagination } from './admin-pagination';

type Category = { id: string; name: string; slug: string; status: 'active' | 'inactive' };
type Subcategory = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
};

export function AdminCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function load() {
    const [categoryResponse, subcategoryResponse] = await Promise.all([
      fetch('/api/admin/categories', { cache: 'no-store' }),
      fetch('/api/admin/subcategories', { cache: 'no-store' }),
    ]);
    if (!categoryResponse.ok || !subcategoryResponse.ok)
      throw new Error('Unable to load taxonomy.');
    setCategories((await categoryResponse.json()).categories);
    setSubcategories((await subcategoryResponse.json()).subcategories);
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : 'Unable to load taxonomy.'),
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const visibleCategories = useMemo(
    () =>
      categories.filter((item) =>
        `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [categories, query],
  );
  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCategories = visibleCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  async function mutate(url: string, method: string, body?: unknown) {
    setError('');
    setMessage('');
    const response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Request failed.');
    await load();
    setMessage('Saved successfully.');
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Manage platform taxonomy and product classification.
        </p>
      </header>
      {message && (
        <p className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>New category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Category name"
            aria-label="Category name"
          />
          <Button
            onClick={() =>
              mutate('/api/admin/categories', 'POST', { name })
                .then(() => setName(''))
                .catch((reason) => setError(reason.message))
            }
          >
            Create
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Category tree</CardTitle>
            <Input
              className="max-w-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories"
              aria-label="Search categories"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {visibleCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories found.</p>
          ) : (
            pagedCategories.map((category) => (
              <div key={category.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.slug} · {category.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        mutate(`/api/admin/categories/${category.id}`, 'PATCH', {
                          status: category.status === 'active' ? 'inactive' : 'active',
                        }).catch((reason) => setError(reason.message))
                      }
                    >
                      {category.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        mutate(`/api/admin/categories/${category.id}`, 'DELETE').catch((reason) =>
                          setError(reason.message),
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 pl-4">
                  {subcategories
                    .filter((item) => item.categoryId === category.id)
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between border-l px-3 py-2 text-sm"
                      >
                        <span>
                          {sub.name}{' '}
                          <span className="text-xs text-muted-foreground">({sub.status})</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            mutate(`/api/admin/subcategories/${sub.id}`, 'PATCH', {
                              status: sub.status === 'active' ? 'inactive' : 'active',
                            }).catch((reason) => setError(reason.message))
                          }
                        >
                          {sub.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    ))}
                  <div className="flex gap-2">
                    <Input
                      value={categoryId === category.id ? subcategoryName : ''}
                      onChange={(event) => {
                        setCategoryId(category.id);
                        setSubcategoryName(event.target.value);
                      }}
                      placeholder="New subcategory"
                      aria-label={`New subcategory for ${category.name}`}
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        mutate('/api/admin/subcategories', 'POST', {
                          categoryId: category.id,
                          name: subcategoryName,
                        })
                          .then(() => setSubcategoryName(''))
                          .catch((reason) => setError(reason.message))
                      }
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
          {visibleCategories.length > 0 && (
            <AdminPagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={visibleCategories.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
