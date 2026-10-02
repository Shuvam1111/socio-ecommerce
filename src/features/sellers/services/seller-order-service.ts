import type { SellerOrder } from '../types/order';

interface StoredSellerSession {
  sellerId?: string;
}

function getSellerId(): string {
  const storedSeller = localStorage.getItem('socio-seller');

  if (!storedSeller) {
    throw new Error('Seller session not found.');
  }

  try {
    const seller = JSON.parse(storedSeller) as StoredSellerSession;

    if (!seller.sellerId) {
      throw new Error('Seller ID is missing.');
    }

    return seller.sellerId;
  } catch {
    throw new Error('Invalid seller session.');
  }
}

async function sellerRequest(url: string, options: RequestInit = {}) {
  const sellerId = getSellerId();

  const response = await fetch(url, {
    ...options,
    headers: {
      'x-seller-id': sellerId,
      ...options.headers,
    },
    cache: 'no-store',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Unable to complete request.');
  }

  return result;
}

export async function getSellerOrders(): Promise<SellerOrder[]> {
  const result = await sellerRequest('/api/seller/orders', {
    method: 'GET',
  });

  return result.orders as SellerOrder[];
}

export async function getSellerOrder(orderId: string): Promise<SellerOrder> {
  const result = await sellerRequest(`/api/seller/orders/${orderId}`, {
    method: 'GET',
  });

  return result.order as SellerOrder;
}

export async function markSellerPaymentReceived(orderId: string) {
  return sellerRequest(`/api/seller/orders/${orderId}/payment/confirm`, {
    method: 'POST',
  });
}

export async function verifySellerOrder(orderId: string) {
  return sellerRequest(`/api/seller/orders/${orderId}/verify`, {
    method: 'POST',
  });
}

export async function deliverSellerOrder(
  orderId: string,
  status: 'ready_to_deliver' | 'out_for_delivery',
) {
  return sellerRequest(`/api/seller/orders/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
}

export async function markSellerOrderDelivered(orderId: string) {
  return sellerRequest(`/api/seller/orders/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'delivered' }),
  });
}

export async function refundSellerOrder(orderId: string, reason: string) {
  return sellerRequest(`/api/seller/orders/${orderId}/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason,
    }),
  });
}
