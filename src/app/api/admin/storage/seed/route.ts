import { NextResponse } from 'next/server';
import {
  requireAdmin,
} from '@/features/auth/services/admin-authorization';
import { mergeJsonSeed } from '@/features/storage/services/json-storage-service';
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

async function report(dryRun: boolean) {
  return Promise.all(
    Object.entries(datasets).map(([key, value]) => mergeJsonSeed(key, value, dryRun)),
  );
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (admin.response) return admin.response;

  try {
    const migrationReport = await report(false);
    return NextResponse.json({
      success: true,
      dryRun: false,
      seeded: migrationReport
        .filter(({ recordsToAdd }) => recordsToAdd > 0)
        .map(({ dataset }) => dataset),
      report: migrationReport,
      message: 'Blob seed migration completed using ID-based merges; existing records were preserved.',
    });
  } catch (error) {
    console.error('Failed to migrate Blob datasets:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to migrate Blob datasets.' },
      { status: 500 },
    );
  }
}
