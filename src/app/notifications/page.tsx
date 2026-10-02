'use client';
/* eslint-disable react-hooks/exhaustive-deps */
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
};
export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const token = typeof window !== 'undefined' ? localStorage.getItem('socio-user-token') : null;
  const seller = typeof window !== 'undefined' ? localStorage.getItem('socio-seller') : null;
  const auth: Record<string, string> = token
    ? { 'x-user-token': token }
    : seller
      ? { 'x-seller-id': seller }
      : {};
  useEffect(() => {
    fetch(`/api/notifications?limit=50&unread=${filter === 'unread'}`, { headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setItems(data.notifications));
  }, [filter]);
  async function read(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: auth });
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Activity</p>
          <h1 className="mt-2 text-3xl font-bold">Notifications</h1>
        </div>
        <div className="flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded-md px-3 py-1.5 text-sm ${filter === 'unread' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            Unread
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {items.length ? (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.actionUrl}
              onClick={() => !item.isRead && void read(item.id)}
              className={`block border-b border-border p-4 last:border-0 ${!item.isRead ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))
        ) : (
          <p className="p-12 text-center text-muted-foreground">No notifications to show.</p>
        )}
      </div>
    </main>
  );
}
