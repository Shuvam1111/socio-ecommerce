import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
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

    const filePath = path.join(process.cwd(), 'src', 'data', 'vendors.json');

    const file = await fs.readFile(filePath, 'utf-8');

    const data = JSON.parse(file);

    const vendors = data.vendors ?? [];

    const vendor = vendors.find((item: { id: string }) => item.id === vendorId);

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

    await fs.writeFile(filePath, JSON.stringify({ vendors }, null, 2), 'utf-8');

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
