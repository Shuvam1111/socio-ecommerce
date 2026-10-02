import { NextResponse } from 'next/server';
import {
  getUserNotifications,
  resolveNotificationPrincipal,
} from '@/features/notifications/services/notification-service';
export async function GET(request: Request) {
  const principal = await resolveNotificationPrincipal(request);
  if (!principal)
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 20) || 20));
  return NextResponse.json(
    await getUserNotifications(
      principal.id,
      page,
      limit,
      url.searchParams.get('unread') === 'true',
    ),
  );
}
