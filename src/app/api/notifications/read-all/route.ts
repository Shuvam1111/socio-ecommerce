import { NextResponse } from 'next/server';
import {
  markAllNotificationsRead,
  resolveNotificationPrincipal,
} from '@/features/notifications/services/notification-service';
export async function POST(request: Request) {
  const principal = await resolveNotificationPrincipal(request);
  if (!principal)
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  return NextResponse.json({ updated: await markAllNotificationsRead(principal.id) });
}
