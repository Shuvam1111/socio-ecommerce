import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { moderateProduct } from '@/features/admin/services/platform-operations-service';
export async function POST(request: Request, { params }: { params: Promise<unknown> }) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  if (!body || !['approved', 'rejected', 'inactive'].includes(String(body.status)))
    return NextResponse.json({ message: 'Valid moderation status is required.' }, { status: 400 });
  try {
    return NextResponse.json({
      product: await moderateProduct(
        (await params as { id: string }).id,
        body.status as 'approved' | 'rejected' | 'inactive',
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to moderate product.' },
      { status: 404 },
    );
  }
}
