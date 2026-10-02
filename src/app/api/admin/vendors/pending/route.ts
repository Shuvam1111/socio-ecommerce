import { NextResponse } from 'next/server';
import { readJson } from '@/features/storage/services/json-storage-service';
import { requireAdmin } from '@/features/auth/services/admin-authorization';

export async function GET(request: Request) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const data = await readJson<{ vendors?: Record<string, unknown>[] }>('vendors.json', {
      vendors: [],
    });

    const pendingVendors = (data.vendors ?? [])
      .filter((vendor) => vendor.status === 'pending')
      .map((vendor: Record<string, unknown>) => {
        const { documents: _documents, bankAccount: _bankAccount, ...safeVendor } = vendor;
        return safeVendor;
      });

    return NextResponse.json({
      vendors: pendingVendors,
    });
  } catch (error) {
    console.error('Failed to load pending vendors:', error);

    return NextResponse.json(
      {
        message: 'Unable to load pending vendors.',
      },
      { status: 500 },
    );
  }
}
