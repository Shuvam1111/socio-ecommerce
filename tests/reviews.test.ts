import { describe, expect, it } from 'vitest';
import {
  aggregateReviews,
  buyerIdFromToken,
  isEligiblePurchase,
  validateReviewInput,
} from '@/features/reviews/services/review-service';
describe('reviews', () => {
  it('accepts only integer ratings from one to five', () => {
    expect(validateReviewInput({ rating: 1, title: '', comment: 'x' })).toBe(true);
    expect(validateReviewInput({ rating: 5, title: 'Title', comment: 'x' })).toBe(true);
    expect(validateReviewInput({ rating: 3.5, title: '', comment: 'x' })).toBe(false);
    expect(validateReviewInput({ rating: 6, title: '', comment: 'x' })).toBe(false);
  });
  it('rejects empty or oversized review content', () => {
    expect(validateReviewInput({ rating: 4, title: 'x'.repeat(101), comment: 'ok' })).toBe(false);
    expect(validateReviewInput({ rating: 4, title: '', comment: '' })).toBe(false);
    expect(validateReviewInput({ rating: 4, title: '', comment: 'x'.repeat(2001) })).toBe(false);
  });
  it('derives buyer identity only from the existing token shape', () => {
    expect(buyerIdFromToken('demo-user-token-USR-000005')).toBe('USR-000005');
    expect(buyerIdFromToken('demo-user-token-USR-000005-other')).toBe('USR-000005-other');
    expect(buyerIdFromToken('seller-token-SEL-1')).toBeNull();
  });
  it('only permits the buyer to review an item from a delivered order', () => {
    const order = {
      buyerId: 'BUYER-A',
      status: 'delivered',
      items: [{ productId: 'PRODUCT-A' }],
    };
    expect(isEligiblePurchase(order as never, 'BUYER-A', 'PRODUCT-A')).toBe(true);
    expect(isEligiblePurchase(order as never, 'BUYER-B', 'PRODUCT-A')).toBe(false);
    expect(isEligiblePurchase(order as never, 'BUYER-A', 'PRODUCT-B')).toBe(false);
    expect(
      isEligiblePurchase({ ...order, status: 'processing' } as never, 'BUYER-A', 'PRODUCT-A'),
    ).toBe(false);
    expect(
      isEligiblePurchase({ ...order, status: 'cancelled' } as never, 'BUYER-A', 'PRODUCT-A'),
    ).toBe(false);
  });

  it('aggregates only approved or published reviews', () => {
    expect(
      aggregateReviews([
        { rating: 5, status: 'approved' },
        { rating: 4, status: 'published' },
        { rating: 1, status: 'rejected' },
      ] as never),
    ).toEqual({ average: 4.5, count: 2 });
  });
});
