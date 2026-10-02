import { NextResponse } from 'next/server';
import { readJson } from '@/features/storage/services/json-storage-service';
import { requireAdmin } from '@/features/auth/services/admin-authorization';

export async function GET(request: Request) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    const data = await readJson<{ sellers?: unknown[] }>('sellers.json', { sellers: [] });

    return NextResponse.json({
      sellers: data.sellers ?? [],
    });
  } catch (error) {
    console.error('Failed to load sellers:', error);

    return NextResponse.json(
      {
        message: 'Unable to load sellers.',
      },
      { status: 500 },
    );
  }
}
