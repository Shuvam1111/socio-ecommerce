import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/features/auth/services/admin-authorization';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAdminSession(response);
  return response;
}
