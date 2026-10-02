import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  readJson,
  readSeedJson,
  writeJson,
} from '@/features/storage/services/json-storage-service';
import { getAdminContext } from '@/features/auth/services/admin-authorization';

export type NotificationRole = 'admin' | 'seller' | 'super_seller' | 'buyer';
export type NotificationType =
  | 'order'
  | 'payment'
  | 'inventory'
  | 'product'
  | 'review'
  | 'vendor'
  | 'account'
  | 'security'
  | 'system';
export type NotificationRecord = {
  id: string;
  recipientId: string;
  recipientRole: NotificationRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  entityType: string;
  entityId: string;
  actionUrl: string;
  createdAt: string;
};

type NotificationFile = { notifications: NotificationRecord[] };
const fileKey = 'notifications.json';

async function readFile() {
  return readJson(fileKey, await readSeedJson<NotificationFile>(fileKey));
}
async function writeFile(data: NotificationFile) {
  await writeJson(fileKey, data);
}

export type CreateNotificationInput = Omit<NotificationRecord, 'id' | 'isRead' | 'createdAt'> & {
  dedupeKey?: string;
};
export async function createNotification(input: CreateNotificationInput) {
  const data = await readFile();
  const duplicate = data.notifications.some(
    (item) =>
      item.recipientId === input.recipientId &&
      item.type === input.type &&
      item.entityType === input.entityType &&
      item.entityId === input.entityId,
  );
  if (duplicate)
    return (
      data.notifications.find(
        (item) =>
          item.recipientId === input.recipientId &&
          item.type === input.type &&
          item.entityType === input.entityType &&
          item.entityId === input.entityId,
      ) ?? null
    );
  const notification: NotificationRecord = {
    ...input,
    id: `NTF-${randomUUID()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  data.notifications.unshift(notification);
  await writeFile(data);
  return notification;
}
export async function getUserNotifications(
  recipientId: string,
  page = 1,
  limit = 20,
  unreadOnly = false,
) {
  const data = await readFile();
  const filtered = data.notifications.filter(
    (item) => item.recipientId === recipientId && (!unreadOnly || !item.isRead),
  );
  const start = Math.max(0, page - 1) * limit;
  return {
    notifications: filtered.slice(start, start + limit),
    total: filtered.length,
    unreadCount: filtered.filter((item) => !item.isRead).length,
  };
}
export async function getUnreadCount(recipientId: string) {
  return (await getUserNotifications(recipientId, 1, 1)).unreadCount;
}
export async function markNotificationRead(recipientId: string, id: string) {
  const data = await readFile();
  const item = data.notifications.find(
    (candidate) => candidate.id === id && candidate.recipientId === recipientId,
  );
  if (!item) return false;
  item.isRead = true;
  await writeFile(data);
  return true;
}
export async function markAllNotificationsRead(recipientId: string) {
  const data = await readFile();
  let changed = 0;
  for (const item of data.notifications)
    if (item.recipientId === recipientId && !item.isRead) {
      item.isRead = true;
      changed++;
    }
  if (changed) await writeFile(data);
  return changed;
}

export async function resolveNotificationPrincipal(request: Request) {
  const users = JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'src/data/users.json'), 'utf8'),
  ) as { users: Array<{ id: string; roles: string[]; status: string }> };
  const token = request.headers.get('x-user-token');
  if (token?.startsWith('demo-user-token-')) {
    const id = token.slice('demo-user-token-'.length);
    const user = users.users.find(
      (item) => item.id === id && item.status === 'active' && item.roles.includes('buyer'),
    );
    if (user) return { id, role: 'buyer' as NotificationRole };
  }
  const cookie = request.headers.get('cookie') ?? '';
  const sellerSession = cookie.match(/(?:^|;\\s*)socio-seller-session=([^;]+)/)?.[1];
  if (sellerSession) {
    const sellers = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'src/data/sellers.json'), 'utf8'),
    ) as { sellers: Array<{ id: string; userId: string; role: NotificationRole; status: string }> };
    const seller = sellers.sellers.find(
      (item) => item.id === sellerSession && item.status === 'active',
    );
    if (seller) return { id: seller.userId, role: seller.role };
  }
  const adminContext = await getAdminContext(request);
  if (adminContext) return { id: adminContext.user.id, role: 'admin' as NotificationRole };
  return null;
}
export async function notifyOrderRecipients(
  order: {
    id: string;
    orderNumber: string;
    buyerId: string;
    items: Array<{ sellerId: string; vendorId: string }>;
  },
  event: {
    type: NotificationType;
    title: string;
    buyerMessage: string;
    sellerMessage?: string;
    actionUrl?: string;
  },
) {
  await createNotification({
    recipientId: order.buyerId,
    recipientRole: 'buyer',
    type: event.type,
    title: event.title,
    message: event.buyerMessage,
    entityType: 'order',
    entityId: order.id,
    actionUrl: event.actionUrl ?? `/orders/${order.id}`,
  });
  if (!event.sellerMessage) return;
  const sellerIds = [...new Set(order.items.map((item) => item.sellerId))];
  const sellers = JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'src/data/sellers.json'), 'utf8'),
  ) as { sellers: Array<{ id: string; userId: string; status: string; role: NotificationRole }> };
  for (const sellerId of sellerIds) {
    const seller = sellers.sellers.find((item) => item.id === sellerId && item.status === 'active');
    if (seller)
      await createNotification({
        recipientId: seller.userId,
        recipientRole: seller.role,
        type: event.type,
        title: event.title,
        message: event.sellerMessage,
        entityType: 'order',
        entityId: order.id,
        actionUrl: `/seller/orders/${order.id}`,
      });
  }
}
