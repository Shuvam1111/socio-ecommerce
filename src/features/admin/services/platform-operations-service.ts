import { readJson, updateJson } from '@/features/storage/services/json-storage-service';
import type { SellerOrder } from '@/features/sellers/types/order';
import type { SellerProduct } from '@/features/sellers/types/product';
import { createNotification } from '@/features/notifications/services/notification-service';

type JsonMap = Record<string, unknown>;
async function read<T extends JsonMap>(name: string, fallback = {} as T): Promise<T> {
  return readJson<T>(name, fallback);
}
async function write(name: string, data: unknown) {
  await updateJson(name, data as JsonMap, () => data as JsonMap);
}

export async function getPlatformMetrics() {
  const [users, vendors, sellers, products, orders, reviews, notifications] = await Promise.all([
    read<{ users: Array<{ roles?: string[]; status?: string }> }>('users.json'),
    read<{ vendors: Array<{ status: string }> }>('vendors.json'),
    read<{ sellers: Array<{ status: string }> }>('sellers.json'),
    read<{ products: SellerProduct[] }>('products.json'),
    read<{ orders: SellerOrder[] }>('orders.json'),
    read<{ reviews: Array<{ status: string; rating: number }> }>('reviews.json'),
    read<{ notifications: Array<{ recipientRole: string; isRead: boolean }> }>(
      'notifications.json',
    ),
  ]);
  const productsList = products.products;
  const ordersList = orders.orders;
  const reviewsList = reviews.reviews;
  return {
    totalUsers: users.users.length,
    activeUsers: users.users.filter((u) => u.status === 'active').length,
    totalVendors: vendors.vendors.length,
    pendingVendors: vendors.vendors.filter((v) => v.status === 'pending').length,
    totalSellers: sellers.sellers.length,
    totalProducts: productsList.length,
    pendingProducts: productsList.filter((p) => p.status === 'pending').length,
    approvedProducts: productsList.filter((p) => p.status === 'approved').length,
    rejectedProducts: productsList.filter((p) => p.status === 'rejected').length,
    inactiveProducts: productsList.filter((p) => p.status === 'inactive').length,
    totalOrders: ordersList.length,
    pendingOrders: ordersList.filter((o) => o.status === 'pending_payment').length,
    deliveredOrders: ordersList.filter((o) => o.status === 'delivered').length,
    paidOrders: ordersList.filter((o) => o.payment.status === 'paid').length,
    orderValue: ordersList.reduce((sum, o) => sum + o.pricing.total, 0),
    totalReviews: reviewsList.length,
    pendingReviews: reviewsList.filter((r) => r.status === 'pending').length,
    approvedReviews: reviewsList.filter((r) => r.status === 'approved' || r.status === 'published')
      .length,
    averageRating: reviewsList.length
      ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1))
      : 0,
    unreadAdminNotifications: notifications.notifications.filter(
      (n) => n.recipientRole === 'admin' && !n.isRead,
    ).length,
  };
}

export async function listProducts(query = '', status = 'all') {
  const { products } = await read<{ products: SellerProduct[] }>('products.json');
  const normalized = query.toLowerCase();
  return products.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      `${p.name} ${p.slug} ${p.vendorId}`.toLowerCase().includes(normalized),
  );
}
export async function getAdminProduct(id: string) {
  const { products } = await read<{ products: SellerProduct[] }>('products.json');
  return products.find((product) => product.id === id) ?? null;
}

export async function updateAdminProduct(
  id: string,
  input: Partial<
    Pick<
      SellerProduct,
      | 'name'
      | 'description'
      | 'shortDescription'
      | 'brand'
      | 'model'
      | 'categoryId'
      | 'subcategoryId'
      | 'images'
      | 'video'
      | 'pricing'
      | 'inventory'
      | 'variants'
      | 'attributes'
      | 'shipping'
      | 'returnPolicy'
      | 'commission'
    >
  >,
) {
  const data = await read<{ products: SellerProduct[] }>('products.json');
  const product = data.products.find((item) => item.id === id);
  if (!product) throw Object.assign(new Error('Product not found.'), { status: 404 });
  const ownership = {
    id: product.id,
    vendorId: product.vendorId,
    sellerId: product.sellerId,
    createdAt: product.createdAt,
  };
  Object.assign(product, input, ownership, { updatedAt: new Date().toISOString() });
  await write('products.json', data);
  return product;
}

export async function moderateProduct(id: string, status: 'approved' | 'rejected' | 'inactive') {
  const data = await read<{ products: SellerProduct[] }>('products.json');
  const product = data.products.find((p) => p.id === id);
  if (!product) throw Object.assign(new Error('Product not found.'), { status: 404 });
  product.status = status;
  product.updatedAt = new Date().toISOString();
  await write('products.json', data);
  const sellers = await read<{
    sellers: Array<{ id: string; userId: string; role: 'seller' | 'super_seller'; status: string }>;
  }>('sellers.json');
  const seller = sellers.sellers.find((s) => s.id === product.sellerId && s.status === 'active');
  if (seller)
    await createNotification({
      recipientId: seller.userId,
      recipientRole: seller.role,
      type: 'product',
      title:
        status === 'approved'
          ? 'Product Approved'
          : status === 'rejected'
            ? 'Product Rejected'
            : 'Product Deactivated',
      message:
        status === 'approved'
          ? `Your product "${product.name}" has been approved.`
          : status === 'rejected'
            ? `Your product "${product.name}" was rejected.`
            : `Your product "${product.name}" was deactivated.`,
      entityType: 'product',
      entityId: product.id,
      actionUrl: `/seller/products/${product.id}`,
    });
  return product;
}
export async function listPlatformOrders(query = '', status = 'all', payment = 'all') {
  const { orders } = await read<{ orders: SellerOrder[] }>('orders.json');
  const q = query.toLowerCase();
  return orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (payment === 'all' || o.payment.status === payment) &&
      `${o.id} ${o.orderNumber} ${o.buyerId}`.toLowerCase().includes(q),
  );
}
export async function getPlatformOrder(id: string) {
  const { orders } = await read<{ orders: SellerOrder[] }>('orders.json');
  return orders.find((o) => o.id === id) ?? null;
}
export async function getSettings() {
  try {
    return await read<JsonMap>('platform-settings.json');
  } catch {
    return {
      platformName: 'Social Commerce',
      marketplaceEnabled: true,
      maintenanceMode: false,
      allowBuyerRegistration: true,
      allowSellerRegistration: true,
      allowProductSubmission: true,
    };
  }
}
export async function updateSettings(input: JsonMap) {
  const current = await getSettings();
  const allowed = [
    'platformName',
    'marketplaceEnabled',
    'maintenanceMode',
    'allowBuyerRegistration',
    'allowSellerRegistration',
    'allowProductSubmission',
  ];
  for (const key of allowed)
    if (key in input) {
      if (
        key === 'platformName' &&
        (typeof input[key] !== 'string' ||
          String(input[key]).trim().length < 2 ||
          String(input[key]).length > 80)
      )
        throw new Error('Invalid platform name.');
      if (key !== 'platformName' && typeof input[key] !== 'boolean')
        throw new Error(`Invalid setting: ${key}.`);
      current[key] = key === 'platformName' ? String(input[key]).trim() : input[key];
    }
  await write('platform-settings.json', current);
  return current;
}
export async function getReports() {
  const metrics = await getPlatformMetrics();
  const { orders } = await read<{ orders: SellerOrder[] }>('orders.json');
  const { users } = await read<{ users: Array<{ roles?: string[]; status?: string }> }>(
    'users.json',
  );
  return {
    ...metrics,
    ordersByStatus: Object.fromEntries(
      [...new Set(orders.map((o) => o.status))].map((s) => [
        s,
        orders.filter((o) => o.status === s).length,
      ]),
    ),
    usersByRole: Object.fromEntries(
      [...new Set(users.flatMap((u) => u.roles ?? []))].map((r) => [
        r,
        users.filter((u) => (u.roles ?? []).includes(r)).length,
      ]),
    ),
  };
}
export { read, write };
export type { SellerOrder };
export type { SellerProduct };
