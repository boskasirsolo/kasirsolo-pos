import type { IDBPDatabase, IDBPTransaction } from "idb";
import type { PosProduct } from "./types/product";
import type { PosTransaction } from "./types/transaction";
import type { PosCategory } from "./types/category";
import type { PosReceipt } from "./types/receipt";
import type { PosStockAdjustment } from "./types/stock";
import type { PosDailyReport } from "./types/report";
import type { PosSettings } from "./types/settings";

/**
 * IndexedDB schema definition for the KASIRSOLO POS database.
 * Used by the `idb` library for type-safe store access.
 */
export interface KspPosDB {
  products: {
    key: string;
    value: PosProduct;
    indexes: {
      "by-barcode": string;
      "by-category": string;
      "by-name": string;
      "by-sync-status": string;
      "by-updated-at": string;
    };
  };
  transactions: {
    key: string;
    value: PosTransaction;
    indexes: {
      "by-number": string;
      "by-date": string;
      "by-sync-status": string;
      "by-cashier": string;
      "by-payment-method": string;
    };
  };
  categories: {
    key: string;
    value: PosCategory;
    indexes: {
      "by-name": string;
      "by-sort-order": number;
    };
  };
  receipts: {
    key: string;
    value: PosReceipt;
    indexes: {
      "by-date": string;
    };
  };
  stock_adjustments: {
    key: string;
    value: PosStockAdjustment;
    indexes: {
      "by-product": string;
      "by-type": string;
      "by-date": string;
      "by-sync-status": string;
    };
  };
  daily_reports: {
    key: string;
    value: PosDailyReport;
    indexes: {
      "by-date": string;
    };
  };
  settings: {
    key: string;
    value: PosSettings;
  };
}

export const CURRENT_VERSION = 1;

type UpgradeDB = IDBPDatabase<KspPosDB>;
type UpgradeTx = IDBPTransaction<KspPosDB, Array<keyof KspPosDB>, "versionchange">;

/**
 * Run all necessary migrations from oldVersion to newVersion.
 */
export function runMigrations(
  db: UpgradeDB,
  oldVersion: number,
  newVersion: number,
  _tx: UpgradeTx
): void {
  if (oldVersion < 1) {
    migrateV1(db);
  }
  // Future migrations:
  // if (oldVersion < 2) migrateV2(db, tx);
  // if (oldVersion < 3) migrateV3(db, tx);

  void newVersion; // reserved for future use
}

/**
 * Version 1: Initial schema creation.
 */
function migrateV1(db: UpgradeDB): void {
  // Products store
  const products = db.createObjectStore("products", { keyPath: "id" });
  products.createIndex("by-barcode", "barcode");
  products.createIndex("by-category", "category_id");
  products.createIndex("by-name", "name");
  products.createIndex("by-sync-status", "sync_status");
  products.createIndex("by-updated-at", "updated_at");

  // Transactions store
  const transactions = db.createObjectStore("transactions", { keyPath: "id" });
  transactions.createIndex("by-number", "transaction_number", { unique: true });
  transactions.createIndex("by-date", "created_at");
  transactions.createIndex("by-sync-status", "sync_status");
  transactions.createIndex("by-cashier", "cashier_id");
  transactions.createIndex("by-payment-method", "payment_method");

  // Categories store
  const categories = db.createObjectStore("categories", { keyPath: "id" });
  categories.createIndex("by-name", "name", { unique: true });
  categories.createIndex("by-sort-order", "sort_order");

  // Receipts store
  const receipts = db.createObjectStore("receipts", { keyPath: "id" });
  receipts.createIndex("by-date", "created_at");

  // Stock adjustments store
  const stockAdj = db.createObjectStore("stock_adjustments", { keyPath: "id" });
  stockAdj.createIndex("by-product", "product_id");
  stockAdj.createIndex("by-type", "type");
  stockAdj.createIndex("by-date", "created_at");
  stockAdj.createIndex("by-sync-status", "sync_status");

  // Daily reports store
  const reports = db.createObjectStore("daily_reports", { keyPath: "id" });
  reports.createIndex("by-date", "date", { unique: true });

  // Settings store (singleton)
  db.createObjectStore("settings", { keyPath: "id" });
}
