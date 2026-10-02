import { NextResponse } from 'next/server';

import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { getPlatformMetrics } from '@/features/admin/services/platform-operations-service';

export async function GET(request: Request) {
  const { response } = await requireAdmin(request);
  if (response) return response;

  try {
    return NextResponse.json({ stats: await getPlatformMetrics() });
  } catch (error) {
    console.error('Admin dashboard error:', error);

    return NextResponse.json(
      {
        message: 'Unable to load admin dashboard.',
      },
      { status: 500 },
    );
  }
}
