/**
 * Re-export local-db engine and queries for convenience.
 * All POS operational data goes through IndexedDB.
 */

// Engine
export {
  openDatabase,
  closeDatabase,
  get,
  put,
  del,
  getAll,
  getAllByIndex,
  query,
  count,
  clear,
  batch,
} from "@kasirsolo/local-db";

// Types
export type {
  PosProduct,
  SyncStatus,
  PosTransaction,
  PosTransactionItem,
  PosPaymentMethod,
  PosCategory,
  PosReceipt,
  PosStockAdjustment,
  StockAdjustmentType,
  PosDailyReport,
  PaymentBreakdown,
  TopProduct,
  PosSettings,
  KspPosDB,
} from "@kasirsolo/local-db";
export { DEFAULT_POS_SETTINGS } from "@kasirsolo/local-db";

// Queries
export {
  getProducts,
  getProductById,
  getProductByBarcode,
  saveProduct,
  deleteProduct,
  getLowStockProducts,
  updateProductStock,
  countProducts,
  searchProducts,
  getTransactions,
  getTransactionById,
  generateTransactionNumber,
  createTransaction,
  voidTransaction,
  calculateTransactionTotals,
  getTodaySummary,
} from "@kasirsolo/local-db";
