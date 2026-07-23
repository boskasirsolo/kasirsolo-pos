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
} from "./engine";

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
} from "./types";
export { DEFAULT_POS_SETTINGS } from "./types";

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
} from "./queries";

// Migration
export { CURRENT_VERSION } from "./migrate";
export type { KspPosDB } from "./migrate";

// Sync
export {
  syncAll,
  hasPendingSync,
  getPendingRecords,
  getPendingCounts,
  markAsSynced,
  markRecordSynced,
  markRecordConflict,
  getLastSyncAt,
  setLastSyncAt,
} from "./sync";
export type { SyncResult, PendingRecords } from "./sync";
