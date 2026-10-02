'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
export function ReviewSection({
  productId,
  initialReviews,
  initialSummary,
}: {
  productId: string;
  initialSummary: { average: number; count: number };
  initialReviews: Array<{
    id: string;
    rating: number;
    title: string;
    comment: string;
    buyerName: string;
    verifiedPurchase: boolean;
    createdAt: string;
  }>;
}) {
  const reviews = initialReviews;
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [eligible, setEligible] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('socio-user-token');
    if (token)
      fetch(`/api/products/${productId}/reviews/context`, { headers: { 'x-user-token': token } })
        .then((response) => response.json())
        .then((data) => {
          setEligible(data.eligible);
          setReviewed(data.reviewed);
          setReviewId(data.reviewId);
          if (data.review) {
            setRating(data.review.rating);
            setTitle(data.review.title ?? '');
            setComment(data.review.comment ?? '');
          }
        });
  }, [productId]);
  async function submit() {
    if (!comment.trim()) return setMessage('Please write a comment before submitting.');
    setPending(true);
    const token = localStorage.getItem('socio-user-token');
    const response = await fetch(
      `/api/products/${productId}/reviews${reviewId ? `?reviewId=${reviewId}` : ''}`,
      {
        method: reviewId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-user-token': token } : {}),
        },
        body: JSON.stringify({ rating, title, comment }),
      },
    );
    const data = await response.json();
    setPending(false);
    if (!response.ok) return setMessage(data.message);
    setMessage('Review submitted for admin moderation.');
    setEligible(false);
    setReviewed(true);
    setReviewId(data.review?.id ?? reviewId);
    setTitle('');
    setComment('');
  }
  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reviews &amp; Ratings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialSummary.average.toFixed(1)} out of 5 · Based on {initialSummary.count} reviews
          </p>
        </div>
      </div>
      {(eligible || reviewed) && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h3 className="font-semibold">{reviewed ? 'Edit your review' : 'Write a review'}</h3>
          <div className="mt-4 flex gap-1" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} stars`}
                onClick={() => setRating(value)}
                className={value <= rating ? 'text-amber-500' : 'text-muted-foreground'}
              >
                ★
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
          <Button className="mt-3" onClick={submit} disabled={pending}>
            {pending ? 'Submitting…' : reviewed ? 'Update review' : 'Submit review'}
          </Button>
          {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
        </div>
      )}
      {!reviews.length ? (
        <p className="mt-6 text-muted-foreground">No approved reviews yet.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-amber-500">
                  {'★'.repeat(review.rating)}
                  <span className="text-muted-foreground">{'★'.repeat(5 - review.rating)}</span>
                </div>
                {review.verifiedPurchase && (
                  <span className="text-xs text-primary">Verified purchase</span>
                )}
              </div>
              <h3 className="mt-2 font-semibold">{review.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
              <p className="mt-3 text-xs text-muted-foreground">{review.buyerName}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
