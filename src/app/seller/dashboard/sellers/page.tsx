'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Search, UserRound, Users } from 'lucide-react';
import { SellerShell } from '@/features/sellers/components/seller-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Seller = {
  id: string;
  role: string;
  status: string;
  employee: { employeeCode: string; designation: string; joiningDate: string };
  user?: { username: string; email: string; firstName?: string; lastName?: string };
};
const emptyForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  designation: 'Sales Staff',
};

export default function ManageSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  async function load() {
    setLoading(true);
    const response = await fetch('/api/seller/sellers', { cache: 'no-store' });
    const result = await response.json();
    if (response.ok) setSellers(result.sellers);
    else toast.error(result.message);
    setLoading(false);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const filtered = useMemo(
    () =>
      sellers.filter((item) => {
        const text =
          `${item.id} ${item.user?.username ?? ''} ${item.user?.email ?? ''} ${item.employee.designation}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (status === 'all' || item.status === status);
      }),
    [sellers, query, status],
  );
  async function addSeller(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch('/api/seller/sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(result.message);
    toast.success('Seller added to your store.');
    setForm(emptyForm);
    void load();
  }
  async function updateSeller(item: Seller, nextStatus: string) {
    const response = await fetch('/api/seller/sellers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });
    const result = await response.json();
    if (!response.ok) return toast.error(result.message);
    toast.success(`Seller ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`);
    void load();
  }
  async function removeSeller(item: Seller) {
    if (!window.confirm(`Remove ${item.user?.username ?? item.id} from this store?`)) return;
    const response = await fetch(`/api/seller/sellers?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!response.ok) return toast.error(result.message);
    toast.success('Seller removed.');
    void load();
  }
  return (
    <SellerShell title="Manage sellers" description="Add and manage your store team">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Store team</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Manage sellers</h1>
            <p className="mt-2 text-muted-foreground">
              Manage seller access for your vendor store.
            </p>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw data-icon="inline-start" /> Refresh
          </Button>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users data-icon="inline-start" /> Current sellers{' '}
                <Badge variant="secondary">{filtered.length}</Badge>
              </CardTitle>
              <CardDescription>Seller records are limited to your vendor.</CardDescription>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="relative min-w-48 flex-1">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search sellers"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {loading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Loading store team...
                </p>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No sellers match your filters.
                </p>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {item.user?.firstName || item.user?.username || item.id}{' '}
                          {item.user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.user?.email ?? 'No email'} · {item.employee.designation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.id} · {item.employee.employeeCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                      {item.role !== 'super_seller' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void updateSeller(
                                item,
                                item.status === 'active' ? 'inactive' : 'active',
                              )
                            }
                          >
                            {item.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void removeSeller(item)}>
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus data-icon="inline-start" /> Add seller
              </CardTitle>
              <CardDescription>Create a login for a normal seller in this store.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addSeller} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Temporary password</Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={6}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    required
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
                <Button className="w-full" disabled={saving}>
                  {saving ? 'Adding seller...' : 'Add seller'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerShell>
  );
}
