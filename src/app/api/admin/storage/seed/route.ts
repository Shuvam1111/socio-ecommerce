import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { seedJsonIfMissing } from '@/features/storage/services/json-storage-service';
import users from '@/data/users.json';
import vendors from '@/data/vendors.json';
import sellers from '@/data/sellers.json';
import products from '@/data/products.json';
import categories from '@/data/categories.json';
import subcategories from '@/data/subcategories.json';
import orders from '@/data/orders.json';
import reviews from '@/data/reviews.json';
import notifications from '@/data/notifications.json';
import carts from '@/data/carts.json';
import platformSettings from '@/data/platform-settings.json';
import inventoryActivities from '@/data/inventory-activities.json';

const datasets = {
  'users.json': users,
  'vendors.json': vendors,
  'sellers.json': sellers,
  'products.json': products,
  'categories.json': categories,
  'subcategories.json': subcategories,
  'orders.json': orders,
  'reviews.json': reviews,
  'notifications.json': notifications,
  'carts.json': carts,
  'platform-settings.json': platformSettings,
  'inventory-activities.json': inventoryActivities,
} as const;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const seeded: string[] = [];
    const skipped: string[] = [];

    for (const [key, value] of Object.entries(datasets)) {
      if (await seedJsonIfMissing(key, value)) seeded.push(key);
      else skipped.push(key);
    }

    return NextResponse.json({
      success: true,
      storeIdConfigured: Boolean(process.env.BLOB_STORE_ID),
      seeded,
      skipped,
      message: seeded.length
        ? 'Missing Blob datasets were initialized without overwriting existing datasets.'
        : 'All required Blob datasets already exist; no data was changed.',
    });
  } catch (error) {
    console.error('Failed to seed Blob datasets:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to initialize Blob datasets.' },
      { status: 500 },
    );
  }
}
