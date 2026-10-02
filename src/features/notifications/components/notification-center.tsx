'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: string;
};
function headers(): Record<string, string> {
  const token = localStorage.getItem('socio-user-token');
  const seller = localStorage.getItem('socio-seller');
  return token ? { 'x-user-token': token } : seller ? { 'x-seller-id': seller } : {};
}
export function NotificationCenter() {
  const [items, setItems] = useState<Notification[]>([]);
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  async function load() {
    const response = await fetch('/api/notifications?limit=5', { headers: headers() });
    if (!response.ok) return;
    const data = await response.json();
    setItems(data.notifications);
    setCount(data.unreadCount);
  }
  useEffect(() => {
    load();
  }, []);
  async function markAll() {
    await fetch('/api/notifications/read-all', { method: 'POST', headers: headers() });
    await load();
  }
  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', headers: headers() });
    await load();
  }
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${count ? `, ${count} unread` : ''}`}
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-primary-foreground">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              type="button"
              onClick={markAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
              Mark all
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length ? (
              items.map((item) => {
                const content = (
                  <>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.message}</p>
                  </>
                );
                const className = `block border-b border-border/70 px-2 py-3 last:border-0 ${!item.isRead ? 'bg-accent/50' : ''}`;
                const handleClick = () => {
                  if (!item.isRead) void markRead(item.id);
                  setOpen(false);
                };

                return item.actionUrl ? (
                  <Link
                    key={item.id}
                    href={item.actionUrl}
                    onClick={handleClick}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={handleClick}
                    className={`w-full text-left ${className}`}
                  >
                    {content}
                  </button>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                You are all caught up.
              </p>
            )}
          </div>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="mt-2 block text-center text-xs font-semibold text-primary"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
