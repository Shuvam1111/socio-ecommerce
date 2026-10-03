'use client';
import { useEffect, useState } from 'react';
import { Package, Settings2, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AdminPagination } from './admin-pagination';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
export type AdminResource =
  'products' | 'orders' | 'categories' | 'reviews' | 'promotions' | 'reports' | 'settings';
const meta = {
  products: ['Products', 'Moderate catalog submissions.', Package],
  orders: ['Orders', 'Platform-wide operational oversight.', ShoppingCart],
  reports: ['Reports', 'Real JSON-derived platform metrics.', BarChart3],
  settings: ['Settings', 'Persisted platform controls.', Settings2],
} as const;
type Product = {
  id: string;
  name: string;
  status: string;
  vendorId: string;
  description: string;
  shortDescription: string;
  brand: string;
  model: string;
  pricing: { salePrice: number; regularPrice: number };
  images: string[];
};
type Order = {
  id: string;
  orderNumber: string;
  status: string;
  payment: { status: string };
  pricing: { total: number };
  createdAt: string;
};
export function AdminResourcePage({ resource }: { resource: AdminResource }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState<Product[] | Order[]>([]);
  const [payload, setPayload] = useState<Record<string, unknown>>({});
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const info = meta[resource as keyof typeof meta] ?? [
    'Admin',
    'Manage platform operations.',
    Package,
  ];
  const Icon = info[2];
  useEffect(() => {
    const endpoint =
      resource === 'products'
        ? `/api/admin/products?q=${encodeURIComponent(query)}&status=${status}`
        : resource === 'orders'
          ? `/api/admin/orders?q=${encodeURIComponent(query)}&status=${status}`
          : resource === 'reports'
            ? '/api/admin/reports'
            : resource === 'settings'
              ? '/api/admin/settings'
              : '';
    if (!endpoint) return;
    fetch(endpoint)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);
        setPayload(data);
        setItems(data.products ?? data.orders ?? []);
        if (data.settings) setSettings(data.settings);
      })
      .catch((e) => setError(e.message));
  }, [resource, query, status]);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  async function openProductEditor(product: Product) {
    setEditOpen(true);
    setEditing(null);
    setEditLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/products/${product.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? 'Unable to load product.');
      setEditing(data.product);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load product.');
    } finally {
      setEditLoading(false);
    }
  }
  async function saveProduct() {
    if (!editing) return;
    if (!editing.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (editing.pricing.salePrice < 0 || editing.pricing.regularPrice < 0) {
      setError('Prices cannot be negative.');
      return;
    }
    const images = editing.images.map((image) => image.trim());
    if (images.some((image) => !image || !/^https?:\/\/[^\s]+$/i.test(image))) {
      setError('Use valid http(s) image URLs and remove empty image entries.');
      return;
    }
    setSaving(true);
    const response = await fetch(`/api/admin/products/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        shortDescription: editing.shortDescription,
        brand: editing.brand,
        model: editing.model,
        pricing: editing.pricing,
        images,
      }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.message ?? 'Unable to update product.');
      return;
    }
    setItems(
      (current) =>
        current.map((item) => (item.id === editing.id ? data.product : item)) as
          Product[] | Order[],
    );
    setEditing(null);
    setEditOpen(false);
  }
  function updateImage(index: number, value: string) {
    if (!editing) return;
    setEditing({
      ...editing,
      images: editing.images.map((image, imageIndex) => (imageIndex === index ? value : image)),
    });
  }

  function addImage() {
    if (!editing) return;
    setEditing({ ...editing, images: [...editing.images, ''] });
  }

  function removeImage(index: number) {
    if (!editing) return;
    setEditing({
      ...editing,
      images: editing.images.filter((_, imageIndex) => imageIndex !== index),
    });
  }

  async function moderate(id: string, next: 'approved' | 'rejected' | 'inactive') {
    const response = await fetch(`/api/admin/products/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (response.ok)
      setItems(
        (current) =>
          current.map((item) =>
            'vendorId' in item && item.id === id ? { ...item, status: next } : item,
          ) as Product[] | Order[],
      );
  }
  async function saveSettings() {
    const response = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) setError((await response.json()).message);
  }
  const reports = payload as Record<string, unknown>;
  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{info[0]}</h1>
            <p className="mt-1 text-muted-foreground">{info[1]}</p>
          </div>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {resource === 'settings' ? (
        <SettingsPanel settings={settings} onChange={setSettings} onSave={saveSettings} />
      ) : resource === 'reports' ? (
        <ReportsPanel data={reports} />
      ) : resource === 'products' || resource === 'orders' ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${resource}...`}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-border bg-background px-3"
            >
              <option value="all">All statuses</option>
              {(resource === 'products'
                ? ['pending', 'approved', 'rejected', 'inactive']
                : ['pending_payment', 'paid', 'processing', 'delivered', 'cancelled']
              ).map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="grid gap-3">
              {pageItems.map((item) =>
                'vendorId' in item ? (
                  <Card key={item.id}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.id} · {item.vendorId} · NPR {item.pricing.salePrice}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs">
                          {item.status}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void openProductEditor(item)}
                        >
                          Edit
                        </Button>
                        {item.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => moderate(item.id, 'approved')}>
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => moderate(item.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={item.id}>
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{item.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.id} · {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">NPR {item.pricing.total.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.status} · {item.payment.status}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
              {!items.length && (
                <p className="text-muted-foreground">No records match these filters.</p>
              )}
              {items.length > 0 && (
                <AdminPagination
                  page={currentPage}
                  pageSize={pageSize}
                  totalItems={items.length}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">
          This admin area is connected to its existing service.
        </p>
      )}
      <AlertDialog open={editOpen} onOpenChange={setEditOpen}>
        <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editing ? `Edit product: ${editing.name}` : 'Edit product'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editLoading
                ? 'Loading the current product data…'
                : 'Update editable catalog details without changing ownership or approval status.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {editLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading product…</p>
          ) : editing ? (
            <div className="flex flex-col gap-3">
              <Input
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
                aria-label="Product name"
                placeholder="Product name"
              />
              <Input
                value={editing.brand}
                onChange={(event) => setEditing({ ...editing, brand: event.target.value })}
                aria-label="Brand"
                placeholder="Brand"
              />
              <Input
                value={editing.model}
                onChange={(event) => setEditing({ ...editing, model: event.target.value })}
                aria-label="Model"
                placeholder="Model"
              />
              <Textarea
                value={editing.shortDescription}
                onChange={(event) =>
                  setEditing({ ...editing, shortDescription: event.target.value })
                }
                aria-label="Short description"
                placeholder="Short description"
              />
              <Textarea
                value={editing.description}
                onChange={(event) => setEditing({ ...editing, description: event.target.value })}
                aria-label="Description"
                placeholder="Description"
              />
              <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <p className="text-sm font-medium">Product images</p>
                {editing.images.map((image, index) => (
                  <div key={`${editing.id}-image-${index}`} className="flex gap-2">
                    <Input
                      value={image}
                      onChange={(event) => updateImage(index, event.target.value)}
                      aria-label={
                        index === 0 ? 'Primary image URL' : `Secondary image ${index} URL`
                      }
                      placeholder={index === 0 ? 'Primary image URL' : 'Secondary image URL'}
                      type="url"
                    />
                    {index > 0 && (
                      <Button type="button" variant="outline" onClick={() => removeImage(index)}>
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addImage}>
                  + Add secondary image
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="number"
                  min="0"
                  value={editing.pricing.salePrice}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      pricing: { ...editing.pricing, salePrice: Number(event.target.value) },
                    })
                  }
                  aria-label="Sale price"
                  placeholder="Sale price"
                />
                <Input
                  type="number"
                  min="0"
                  value={editing.pricing.regularPrice}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      pricing: { ...editing.pricing, regularPrice: Number(event.target.value) },
                    })
                  }
                  aria-label="Regular price"
                  placeholder="Regular price"
                />
              </div>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <Button onClick={() => void saveProduct()} disabled={!editing || editLoading || saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
function ReportsPanel({ data }: { data: Record<string, unknown> }) {
  const rows = Object.entries(data).filter(([, value]) => typeof value === 'number');
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map(([key, value]) => (
        <Card key={key}>
          <CardHeader>
            <CardTitle className="text-sm capitalize text-muted-foreground">
              {key.replaceAll(/([A-Z])/g, ' $1')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {typeof value === 'number' ? value.toLocaleString() : String(value)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
function SettingsPanel({
  settings,
  onChange,
  onSave,
}: {
  settings: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onSave: () => void;
}) {
  const fields = [
    'marketplaceEnabled',
    'maintenanceMode',
    'allowBuyerRegistration',
    'allowSellerRegistration',
    'allowProductSubmission',
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm">
            Platform name
            <Input
              className="mt-2"
              value={String(settings.platformName ?? '')}
              onChange={(e) => onChange({ ...settings, platformName: e.target.value })}
            />
          </label>
          {fields.map((field) => (
            <label
              key={field}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm"
            >
              <span>{field.replaceAll(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={Boolean(settings[field])}
                onChange={(e) => onChange({ ...settings, [field]: e.target.checked })}
              />
            </label>
          ))}
          <Button onClick={onSave}>Save settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
