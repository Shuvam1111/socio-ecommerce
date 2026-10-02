import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  createNotification,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/notifications/services/notification-service';
const file = path.join(process.cwd(), 'src/data/notifications.json');
let original = '';
beforeEach(async () => {
  if (!original) original = await fs.readFile(file, 'utf8');
  await fs.writeFile(file, '{"notifications":[]}');
});
afterAll(async () => {
  if (original) await fs.writeFile(file, original);
});
describe('notifications', () => {
  it('creates a notification and deduplicates the same event', async () => {
    const input = {
      recipientId: 'USR-000005',
      recipientRole: 'buyer' as const,
      type: 'order' as const,
      title: 'Order Placed',
      message: 'Placed',
      entityType: 'order',
      entityId: 'ORD-TEST',
      actionUrl: '/orders/ORD-TEST',
    };
    await createNotification(input);
    await createNotification(input);
    expect(await getUnreadCount('USR-000005')).toBe(1);
  });
  it('isolates read operations by recipient', async () => {
    const item = await createNotification({
      recipientId: 'USR-000005',
      recipientRole: 'buyer',
      type: 'order',
      title: 'Order',
      message: 'Message',
      entityType: 'order',
      entityId: 'ORD-READ',
      actionUrl: '/orders/ORD-READ',
    });
    expect(await markNotificationRead('USR-000006', item!.id)).toBe(false);
    expect(await markNotificationRead('USR-000005', item!.id)).toBe(true);
    expect(await getUnreadCount('USR-000005')).toBe(0);
  });
  it('marks only the current recipient notifications as read', async () => {
    await createNotification({
      recipientId: 'USR-000005',
      recipientRole: 'buyer',
      type: 'system',
      title: 'A',
      message: 'A',
      entityType: 'system',
      entityId: 'A',
      actionUrl: '/notifications',
    });
    await createNotification({
      recipientId: 'USR-000006',
      recipientRole: 'buyer',
      type: 'system',
      title: 'B',
      message: 'B',
      entityType: 'system',
      entityId: 'B',
      actionUrl: '/notifications',
    });
    expect(await markAllNotificationsRead('USR-000005')).toBe(1);
    expect(await getUnreadCount('USR-000006')).toBe(1);
  });
});
