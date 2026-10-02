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

    const search = new URL(request.url).searchParams.get('search')?.trim().toLowerCase() ?? '';
    const status = new URL(request.url).searchParams.get('status');
    const vendors = (data.vendors ?? [])
      .filter((vendor: Record<string, unknown>) => {
        const store = vendor.store as Record<string, unknown> | undefined;
        const business = vendor.business as Record<string, unknown> | undefined;
        const contact = vendor.contact as Record<string, unknown> | undefined;
        const text = [vendor.id, store?.name, store?.slug, business?.legalName, contact?.email]
          .filter((value): value is string => typeof value === 'string')
          .join(' ')
          .toLowerCase();
        return (!search || text.includes(search)) && (!status || vendor.status === status);
      })
      .map((vendor: Record<string, unknown>) => {
        const { documents: _documents, bankAccount: _bankAccount, ...safeVendor } = vendor;
        return safeVendor;
      });
    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Failed to load vendors:', error);

    return NextResponse.json(
      {
        message: 'Unable to load vendors.',
      },
      { status: 500 },
    );
  }
}
