'use client';

import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';

interface BuyerProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  status?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<BuyerProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('socio-user');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as BuyerProfile;
      const frame = requestAnimationFrame(() => setUser(parsed));
      return () => cancelAnimationFrame(frame);
    } catch {
      localStorage.removeItem('socio-user');
    }
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Account</p>
      <h1 className="mt-2 text-3xl font-bold">Profile</h1>
      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">
              {user ? `${user.firstName} ${user.lastName}` : 'Your profile'}
            </h2>
            <p className="text-sm text-muted-foreground">Authenticated buyer account</p>
          </div>
        </div>
        {user ? (
          <dl className="mt-8 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted-foreground">Username</dt>
              <dd>@{user.username}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted-foreground">Account status</dt>
              <dd>{user.status ?? 'Active'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd>{user.roles.join(', ')}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">Sign in to view your profile.</p>
        )}
      </section>
    </main>
  );
}
