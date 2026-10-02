import { NextResponse } from 'next/server';
import {
  markNotificationRead,
  resolveNotificationPrincipal,
} from '@/features/notifications/services/notification-service';
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const principal = await resolveNotificationPrincipal(request);
  if (!principal)
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  const { id } = await params;
  if (!(await markNotificationRead(principal.id, id)))
    return NextResponse.json({ message: 'Notification not found.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
