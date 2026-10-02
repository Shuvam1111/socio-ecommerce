export type InventoryAdjustmentType =
  'increase' | 'decrease' | 'reserved' | 'released' | 'finalized' | 'restored';

export type InventoryStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface SellerInventoryItem {
  productId: string;
  vendorId: string;
  sellerId: string;

  productName: string;
  productImage: string | null;

  sku: string;
  barcode: string;

  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;

  lowStockThreshold: number;

  status: InventoryStockStatus;

  updatedAt: string;
}

export interface InventoryAdjustmentInput {
  type: InventoryAdjustmentType;
  quantity: number;
  reason: string;
}

export interface InventoryActivity {
  orderId?: string;
  changedBy?: string;
  id: string;

  productId: string;
  vendorId: string;
  sellerId: string;

  productName: string;
  sku: string;

  type: InventoryAdjustmentType;

  quantity: number;

  quantityBefore: number;
  quantityAfter: number;

  availableQuantityBefore: number;
  availableQuantityAfter: number;

  reason: string;

  createdAt: string;
}

export interface InventorySummary {
  totalProducts: number;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}
