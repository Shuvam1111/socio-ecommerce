import type {
  InventoryActivity,
  InventoryAdjustmentInput,
  InventorySummary,
  SellerInventoryItem,
} from '../types/inventory';

import type {
  ProductInventory,
} from '../types/product';

interface StoredSellerSession {
  sellerId?: string;
}

function getSellerId(): string {
  const storedSeller =
    localStorage.getItem(
      'socio-seller',
    );

  if (!storedSeller) {
    throw new Error(
      'Seller session not found.',
    );
  }

  try {
    const seller =
      JSON.parse(
        storedSeller,
      ) as StoredSellerSession;

    if (!seller.sellerId) {
      throw new Error(
        'Seller ID is missing.',
      );
    }

    return seller.sellerId;
  } catch {
    throw new Error(
      'Invalid seller session.',
    );
  }
}

async function sellerRequest(
  url: string,
  options: RequestInit = {},
) {
  const sellerId =
    getSellerId();

  const response =
    await fetch(url, {
      ...options,

      headers: {
        'x-seller-id': sellerId,
        ...options.headers,
      },

      cache: 'no-store',
    });

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        'Unable to complete request.',
    );
  }

  return result;
}

export async function getSellerInventory(): Promise<{
  inventory: SellerInventoryItem[];
  summary: InventorySummary;
}> {
  const result =
    await sellerRequest(
      '/api/seller/inventory',
    );

  return {
    inventory:
      result.inventory as SellerInventoryItem[],

    summary:
      result.summary as InventorySummary,
  };
}

export async function adjustSellerInventory(
  productId: string,
  input: InventoryAdjustmentInput,
): Promise<{
  inventory: ProductInventory;
  activity: InventoryActivity;
}> {
  const result =
    await sellerRequest(
      `/api/seller/inventory/${productId}/adjust`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(input),
      },
    );

  return {
    inventory:
      result.inventory as ProductInventory,

    activity:
      result.activity as InventoryActivity,
  };
}
