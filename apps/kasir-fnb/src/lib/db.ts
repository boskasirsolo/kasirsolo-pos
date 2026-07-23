/**
 * Local IndexedDB for KASIRSOLO F&B.
 *
 * FnB-specific stores:
 * - pos_menu_items
 * - pos_menu_categories
 * - pos_menu_modifiers
 * - pos_tables
 * - pos_fnb_transactions
 * - pos_kitchen_orders
 * - pos_fnb_receipts
 * - pos_fnb_daily_reports
 * - pos_fnb_settings
 */

const DB_NAME = "kasirsolo_fnb";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Menu items
      if (!db.objectStoreNames.contains("menu_items")) {
        const store = db.createObjectStore("menu_items", { keyPath: "id" });
        store.createIndex("category_id", "category_id", { unique: false });
        store.createIndex("is_available", "is_available", { unique: false });
        store.createIndex("sort_order", "sort_order", { unique: false });
      }

      // Menu categories
      if (!db.objectStoreNames.contains("menu_categories")) {
        const store = db.createObjectStore("menu_categories", { keyPath: "id" });
        store.createIndex("sort_order", "sort_order", { unique: false });
      }

      // Menu modifiers
      if (!db.objectStoreNames.contains("menu_modifiers")) {
        db.createObjectStore("menu_modifiers", { keyPath: "id" });
      }

      // Tables
      if (!db.objectStoreNames.contains("tables")) {
        const store = db.createObjectStore("tables", { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("zone", "zone", { unique: false });
        store.createIndex("number", "number", { unique: true });
      }

      // FnB Transactions
      if (!db.objectStoreNames.contains("fnb_transactions")) {
        const store = db.createObjectStore("fnb_transactions", { keyPath: "id" });
        store.createIndex("created_at", "created_at", { unique: false });
        store.createIndex("order_type", "order_type", { unique: false });
        store.createIndex("table_id", "table_id", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("kitchen_status", "kitchen_status", { unique: false });
      }

      // Kitchen orders
      if (!db.objectStoreNames.contains("kitchen_orders")) {
        const store = db.createObjectStore("kitchen_orders", { keyPath: "id" });
        store.createIndex("transaction_id", "transaction_id", { unique: false });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("created_at", "created_at", { unique: false });
      }

      // FnB Receipts
      if (!db.objectStoreNames.contains("fnb_receipts")) {
        const store = db.createObjectStore("fnb_receipts", { keyPath: "id" });
        store.createIndex("transaction_id", "transaction_id", { unique: false });
      }

      // FnB Daily Reports
      if (!db.objectStoreNames.contains("fnb_daily_reports")) {
        const store = db.createObjectStore("fnb_daily_reports", { keyPath: "id" });
        store.createIndex("date", "date", { unique: true });
      }

      // FnB Settings
      if (!db.objectStoreNames.contains("fnb_settings")) {
        db.createObjectStore("fnb_settings", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error("Gagal membuka database lokal"));
    };
  });
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Generic CRUD helpers

export function get<T>(storeName: string, key: string): Promise<T | undefined> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

export function getAll<T>(storeName: string): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export function getAllByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export function put<T>(storeName: string, data: T): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(data);
    request.onerror = () => reject(request.error);
  });
}

export function del(storeName: string, key: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function clear(storeName: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function count(storeName: string): Promise<number> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Query records within an index range.
 */
export function query<T>(
  storeName: string,
  indexName: string,
  range: IDBKeyRange
): Promise<T[]> {
  return new Promise(async (resolve, reject) => {
    const db = await openDatabase();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(range);
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

// ────────────────────────────────────────────────────────────
// FnB-specific default settings
// ────────────────────────────────────────────────────────────

export interface FnbSettings {
  id: string;
  store_name: string;
  store_address: string | null;
  store_phone: string | null;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_label: string;
  service_charge_enabled: boolean;
  service_charge_percentage: number;
  default_order_type: "dine_in" | "takeaway" | "delivery";
  kds_enabled: boolean;
  kds_auto_print: boolean;
  table_count: number;
  queue_enabled: boolean;
  receipt_footer: string;
  receipt_format: "thermal_58mm" | "thermal_80mm" | "a4";
  sound_enabled: boolean;
  updated_at: string;
}

export const DEFAULT_FNB_SETTINGS: FnbSettings = {
  id: "settings",
  store_name: "KASIRSOLO F&B",
  store_address: null,
  store_phone: null,
  tax_enabled: true,
  tax_percentage: 11,
  tax_label: "PPN",
  service_charge_enabled: false,
  service_charge_percentage: 5,
  default_order_type: "dine_in",
  kds_enabled: true,
  kds_auto_print: false,
  table_count: 10,
  queue_enabled: true,
  receipt_footer: "Terima kasih atas kunjungan Anda!",
  receipt_format: "thermal_58mm",
  sound_enabled: true,
  updated_at: new Date().toISOString(),
};
