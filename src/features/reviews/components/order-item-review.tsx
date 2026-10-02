'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ReviewContext = { eligible: boolean; reviewed: boolean };

export function OrderItemReview({ productId }: { productId: string }) {
  const [context, setContext] = useState<ReviewContext | null>(null);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('socio-user-token');
    if (!token) return;
    fetch(`/api/products/${productId}/reviews/context`, {
      headers: { 'x-user-token': token },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setContext(data);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  async function submit() {
    const token = localStorage.getItem('socio-user-token');
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'x-user-token': token } : {}) },
      body: JSON.stringify({ rating, title, comment }),
    });
    const data = await response.json();
    setMessage(
      data.message ??
        (response.ok ? 'Review submitted for moderation.' : 'Unable to submit review.'),
    );
    if (response.ok) {
      setOpen(false);
      setContext({ eligible: false, reviewed: true });
      setTitle('');
      setComment('');
    }
  }

  if (context?.reviewed) {
    return <span className="text-sm font-medium text-primary">Reviewed</span>;
  }
  if (!context?.eligible && !open) return null;

  return (
    <div className="mt-3">
      {!open ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Rate &amp; Review
        </Button>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold">Your rating</p>
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={value === rating}
                aria-label={`${value} stars`}
                onClick={() => setRating(value)}
                className={value <= rating ? 'text-amber-500' : 'text-muted-foreground'}
              >
                {value <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <Input
            className="mt-3"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            maxLength={100}
          />
          <Textarea
            className="mt-3"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share your experience"
            maxLength={2000}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" onClick={submit}>
              Submit review
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
          {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
        </div>
      )}
    </div>
  );
}
