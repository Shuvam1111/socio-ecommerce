import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { listPlatformOrders } from '@/features/admin/services/platform-operations-service';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const url = new URL(request.url);
  return NextResponse.json({
    orders: await listPlatformOrders(
      url.searchParams.get('q') ?? '',
      url.searchParams.get('status') ?? 'all',
      url.searchParams.get('payment') ?? 'all',
    ),
  });
}
