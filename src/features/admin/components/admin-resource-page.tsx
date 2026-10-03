'use client';
import { useEffect, useState } from 'react';
import { Package, Settings2, ShoppingCart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AdminPagination } from './admin-pagination';
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
  pricing: { salePrice: number };
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
    <div className="space-y-6">
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
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">{item.status}</span>
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
        </>
      ) : (
        <p className="text-muted-foreground">
          This admin area is connected to its existing service.
        </p>
      )}
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
