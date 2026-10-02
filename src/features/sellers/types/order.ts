export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'ready_to_deliver'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type PaymentMethod =
  | 'online'
  | 'cash_on_delivery';

export interface OrderItem {
  productId: string;
  sellerId: string;
  vendorId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPricing {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  city: string;
  street: string;
  postalCode: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string | null;
  paidAt: string | null;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  changedBy: string;
  timestamp: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;

  buyerId: string;

  vendorId: string;
  sellerId: string;

  items: OrderItem[];

  pricing: OrderPricing;

  paymentId: string;

  payment: OrderPayment;

  status: OrderStatus;

  shippingAddress: ShippingAddress;

  customerNote: string | null;

  timeline: OrderTimelineEntry[];

  createdAt: string;
  updatedAt: string;
}
