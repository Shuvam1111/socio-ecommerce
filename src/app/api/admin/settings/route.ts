import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { getSettings, updateSettings } from '@/features/admin/services/platform-operations-service';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ settings: await getSettings() });
}
export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return NextResponse.json({ message: 'Settings object is required.' }, { status: 400 });
  try {
    return NextResponse.json({ settings: await updateSettings(body as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to update settings.' },
      { status: 400 },
    );
  }
}
