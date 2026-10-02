'use client';
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
type Review = {
  id: string;
  productId: string;
  buyerName: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
};
export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  async function load() {
    const response = await fetch('/api/admin/reviews');
    const data = await response.json();
    if (!response.ok) return setError(data.message);
    setReviews(data.reviews);
  }
  useEffect(() => {
    load();
  }, []);
  async function moderate(id: string, next: 'approved' | 'rejected') {
    const response = await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: next }),
    });
    if (response.ok) load();
  }
  const visible = reviews.filter(
    (review) =>
      (status === 'all' || review.status === status) &&
      `${review.title} ${review.comment} ${review.productId}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section>
      <h1 className="text-3xl font-semibold">Review moderation</h1>
      <p className="mt-1 text-muted-foreground">
        Approve verified buyer feedback before it appears publicly.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reviews"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-border bg-background px-3"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
        </select>
      </div>
      {error && <p className="mt-4 text-destructive">{error}</p>}
      <div className="mt-6 grid gap-4">
        {visible.map((review) => (
          <article key={review.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{review.title}</p>
                <p className="text-sm text-muted-foreground">
                  {review.productId} · {review.buyerName}
                </p>
              </div>
              <span className="text-amber-500">{'★'.repeat(review.rating)}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => moderate(review.id, 'approved')}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => moderate(review.id, 'rejected')}>
                Reject
              </Button>
            </div>
          </article>
        ))}
        {!visible.length && (
          <p className="text-muted-foreground">No reviews match these filters.</p>
        )}
      </div>
    </section>
  );
}
