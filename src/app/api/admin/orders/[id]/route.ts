import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { getPlatformOrder } from '@/features/admin/services/platform-operations-service';
export async function GET(request: Request, { params }: { params: Promise<unknown> }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const order = await getPlatformOrder((await params as { id: string }).id);
  return order
    ? NextResponse.json({ order })
    : NextResponse.json({ message: 'Order not found.' }, { status: 404 });
}
