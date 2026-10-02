import { describe, expect, it } from 'vitest';
import {
  getPlatformMetrics,
  getReports,
  getSettings,
  listPlatformOrders,
  listProducts,
} from '@/features/admin/services/platform-operations-service';
describe('admin platform operations', () => {
  it('derives dashboard metrics from JSON data', async () => {
    const metrics = await getPlatformMetrics();
    expect(metrics.totalOrders).toBe(37);
    expect(metrics.totalProducts).toBeGreaterThan(0);
    expect(metrics.orderValue).toBe(1049075);
    expect(metrics.deliveredOrders).toBe(27);
  });
  it('filters platform orders server-side', async () => {
    const orders = await listPlatformOrders('ORD-000001', 'all', 'paid');
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe('ORD-000001');
  });
  it('filters products by moderation status', async () => {
    const products = await listProducts('', 'approved');
    expect(products.every((product) => product.status === 'approved')).toBe(true);
  });
  it('reports real operational breakdowns', async () => {
    const reports = await getReports();
    expect(reports.ordersByStatus).toEqual({
      delivered: 27,
      processing: 1,
      ready_to_deliver: 2,
      out_for_delivery: 1,
      paid: 1,
      pending_payment: 2,
      cancelled: 1,
      refund_requested: 1,
      refunded: 1,
    });
  });
  it('reads persisted platform settings', async () => {
    const settings = await getSettings();
    expect(settings.platformName).toBe('Social Commerce');
    expect(settings.maintenanceMode).toBe(false);
  });
});
