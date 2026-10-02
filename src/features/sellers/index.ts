export { SellerOrdersPage } from './components/seller-orders-page';
export { SellerProductsPage } from './components/seller-products-page';

export {
  getSellerProducts,
  getSellerProduct,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from './services/seller-product-service';

export type {
  SellerProduct,
  ProductStatus,
  ProductPricing,
  ProductInventory,
  ProductVariant,
  ProductAttributes,
  ProductShipping,
  ProductReturnPolicy,
  ProductCommission,
  ProductRating,
  CreateSellerProductInput,
} from './types/product';
export { SellerInventoryPage } from './components/seller-inventory-page';

export {
  getSellerInventory,
  adjustSellerInventory,
} from './services/seller-inventory-service';

export type {
  InventoryAdjustmentType,
  InventoryStockStatus,
  SellerInventoryItem,
  InventoryAdjustmentInput,
  InventoryActivity,
  InventorySummary,
} from './types/inventory';
