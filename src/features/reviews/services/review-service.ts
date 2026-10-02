import {
  readJson,
  readSeedJson,
  writeJson,
} from '@/features/storage/services/json-storage-service';
import type { SellerOrder } from '@/features/sellers/types/order';
import { createNotification } from '@/features/notifications/services/notification-service';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'published';
export type ReviewRecord = {
  id: string;
  productId: string;
  orderId: string;
  buyerId: string;
  rating: number;
  title: string;
  comment: string;
  status: ReviewStatus;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
};
type ReviewFile = { reviews: ReviewRecord[] };
type OrdersFile = { orders: SellerOrder[] };
type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  roles?: string[];
  status?: string;
};
type UsersFile = { users: User[] };

const reviewsKey = 'reviews.json';
const ordersKey = 'orders.json';
async function read<T>(file: string): Promise<T> {
  return readJson<T>(file, {} as T);
}


export function buyerIdFromToken(token: string | null) {
  return token?.startsWith('demo-user-token-') ? token.slice('demo-user-token-'.length) : null;
}
export function publicReview(review: ReviewRecord, users: User[]) {
  const buyer = users.find((user) => user.id === review.buyerId);
  return {
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    verifiedPurchase: review.verifiedPurchase,
    createdAt: review.createdAt,
    buyerName: buyer
      ? [buyer.firstName, buyer.lastName].filter(Boolean).join(' ') || buyer.username || 'Buyer'
      : 'Buyer',
  };
}
export function isEligiblePurchase(order: SellerOrder, buyerId: string, productId: string) {
  return (
    order.buyerId === buyerId &&
    order.status === 'delivered' &&
    order.items.some((item) => item.productId === productId)
  );
}

export function aggregateReviews(reviews: ReviewRecord[]) {
  const approved = reviews.filter(
    (review) => review.status === 'approved' || review.status === 'published',
  );
  return {
    average: approved.length
      ? Number(
          (approved.reduce((sum, review) => sum + review.rating, 0) / approved.length).toFixed(1),
        )
      : 0,
    count: approved.length,
  };
}
export function validateReviewInput(input: unknown) {
  const body = input as { rating?: unknown; title?: unknown; comment?: unknown };
  return (
    Number.isInteger(body.rating) &&
    Number(body.rating) >= 1 &&
    Number(body.rating) <= 5 &&
    typeof body.title === 'string' &&
    body.title.trim().length <= 100 &&
    typeof body.comment === 'string' &&
    body.comment.trim().length > 0 &&
    body.comment.trim().length <= 2000
  );
}
export async function getReviews(productId: string) {
  const [{ reviews }, { users }] = await Promise.all([
    readJson<ReviewFile>(reviewsKey, await readSeedJson<ReviewFile>(reviewsKey)),
    readJson<UsersFile>('users.json', { users: [] }),
  ]);
  const visible = reviews.filter(
    (review) =>
      review.productId === productId &&
      (review.status === 'approved' || review.status === 'published'),
  );
  return visible.map((review) => publicReview(review, users));
}
export async function getReviewSummary(productId: string) {
  const { reviews } = await readJson<ReviewFile>(
    reviewsKey,
    await readSeedJson<ReviewFile>(reviewsKey),
  );
  return aggregateReviews(reviews.filter((review) => review.productId === productId));
}
export async function getReviewContext(productId: string, buyerId: string) {
  const [{ reviews }, { orders }] = await Promise.all([
    readJson<ReviewFile>(reviewsKey, await readSeedJson<ReviewFile>(reviewsKey)),
    readJson<OrdersFile>(ordersKey, await readSeedJson<OrdersFile>(ordersKey)),
  ]);
  const purchased = orders.some((order) => isEligiblePurchase(order, buyerId, productId));
  const review = reviews.find((item) => item.productId === productId && item.buyerId === buyerId);
  return {
    eligible: purchased && !review,
    reviewed: Boolean(review),
    reviewId: review?.id ?? null,
  };
}
export async function createReview(
  productId: string,
  buyerId: string,
  input: { rating: number; title: string; comment: string },
) {
  const [reviewFile, orderFile] = await Promise.all([
    readJson<ReviewFile>(reviewsKey, await readSeedJson<ReviewFile>(reviewsKey)),
    readJson<OrdersFile>(ordersKey, await readSeedJson<OrdersFile>(ordersKey)),
  ]);
  const order = orderFile.orders.find((candidate) =>
    isEligiblePurchase(candidate, buyerId, productId),
  );
  if (!order)
    throw Object.assign(new Error('A delivered, paid purchase is required.'), { status: 403 });
  if (
    reviewFile.reviews.some(
      (review) => review.productId === productId && review.buyerId === buyerId,
    )
  )
    throw Object.assign(new Error('You have already reviewed this product.'), { status: 409 });
  const now = new Date().toISOString();
  const review: ReviewRecord = {
    id: `REV-${String(reviewFile.reviews.length + 1).padStart(6, '0')}`,
    productId,
    orderId: order.id,
    buyerId,
    rating: input.rating,
    title: input.title.trim(),
    comment: input.comment.trim(),
    status: 'pending',
    verifiedPurchase: true,
    createdAt: now,
    updatedAt: now,
  };
  reviewFile.reviews.push(review);
  await writeJson(reviewsKey, reviewFile);
  return review;
}
export async function moderateReview(id: string, status: 'approved' | 'rejected') {
  const file = await readJson<ReviewFile>(reviewsKey, await readSeedJson<ReviewFile>(reviewsKey));
  const review = file.reviews.find((item) => item.id === id);
  if (!review) throw Object.assign(new Error('Review not found.'), { status: 404 });
  review.status = status;
  review.updatedAt = new Date().toISOString();
  await writeJson(reviewsKey, file);
  try {
    await createNotification({
      recipientId: review.buyerId,
      recipientRole: 'buyer',
      type: 'review',
      title: status === 'approved' ? 'Review Approved' : 'Review Rejected',
      message:
        status === 'approved'
          ? 'Your review is now published.'
          : 'Your review was not approved for publication.',
      entityType: 'review',
      entityId: review.id,
      actionUrl: `/products/${review.productId}`,
    });
  } catch (error) {
    console.error('[notifications] review moderation notification failed', error);
  }
  return review;
}
export async function listReviews() {
  const [{ reviews }, { users }] = await Promise.all([
    readJson<ReviewFile>(reviewsKey, await readSeedJson<ReviewFile>(reviewsKey)),
    readJson<UsersFile>('users.json', { users: [] }),
  ]);
  return reviews.map((review) => ({
    ...publicReview(review, users),
    status: review.status,
    productId: review.productId,
  }));
}
export async function getBuyerReviewContext(productId: string, token: string | null) {
  const buyerId = buyerIdFromToken(token);
  return buyerId
    ? getReviewContext(productId, buyerId)
    : { eligible: false, reviewed: false, reviewId: null };
}
