export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalReviews: number;
  pendingProducts?: number;
  approvedProducts?: number;
  deliveredOrders?: number;
  orderValue?: number;
  pendingReviews?: number;
  unreadAdminNotifications?: number;
}

export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
}
