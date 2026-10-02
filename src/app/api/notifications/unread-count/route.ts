import { NextResponse } from 'next/server';
import {
  getUnreadCount,
  resolveNotificationPrincipal,
} from '@/features/notifications/services/notification-service';
export async function GET(request: Request) {
  const principal = await resolveNotificationPrincipal(request);
  if (!principal)
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  return NextResponse.json({ count: await getUnreadCount(principal.id) });
}
