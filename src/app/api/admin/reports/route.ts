import { NextResponse } from 'next/server';
import { requireAdmin } from '@/features/auth/services/admin-authorization';
import { getReports } from '@/features/admin/services/platform-operations-service';
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  return NextResponse.json({ reports: await getReports() });
}
