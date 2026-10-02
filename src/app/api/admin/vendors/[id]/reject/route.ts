import { NextResponse } from 'next/server';
import { readJson, updateJson } from '@/features/storage/services/json-storage-service';
import { requireAdmin } from '@/features/auth/services/admin-authorization';

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const { id: vendorId } = await context.params;

    const body = await request.json();

    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

    if (!reason) {
      return NextResponse.json(
        {
          message: 'A rejection reason is required.',
        },
        { status: 400 },
      );
    }

    const data = await readJson<{ vendors: Array<Record<string, unknown>> }>('vendors.json', {
      vendors: [],
    });

    const vendors = data.vendors ?? [];

    const vendor = vendors.find((item) => item.id === vendorId);

    if (!vendor) {
      return NextResponse.json(
        {
          message: 'Vendor not found.',
        },
        { status: 404 },
      );
    }

    if (vendor.status !== 'pending') {
      return NextResponse.json(
        {
          message: 'Only pending vendors can be rejected.',
        },
        { status: 400 },
      );
    }

    vendor.status = 'rejected';
    vendor.rejectionReason = reason;

    await updateJson('vendors.json', { vendors: [] }, () => ({ vendors }));

    return NextResponse.json({
      message: 'Vendor rejected successfully.',
      vendor,
    });
  } catch (error) {
    console.error('Vendor rejection failed:', error);

    return NextResponse.json(
      {
        message: 'Unable to reject vendor.',
      },
      { status: 500 },
    );
  }
}
