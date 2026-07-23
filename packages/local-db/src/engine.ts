import { openDB, IDBPDatabase, IDBPTransaction, StoreNames } from "idb";
import type { KspPosDB } from "./migrate";

const DB_NAME = "kasirsolo-pos";

let dbInstance: IDBPDatabase<KspPosDB> | null = null;

/**
 * Open (or return cached) IndexedDB connection.
 * Migrations are handled in migrate.ts via the upgrade callback.
 */
export async function openDatabase(
  version?: number
): Promise<IDBPDatabase<KspPosDB>> {
  if (dbInstance) return dbInstance;

  const { runMigrations, CURRENT_VERSION } = await import("./migrate");

  dbInstance = await openDB<KspPosDB>(DB_NAME, version ?? CURRENT_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      runMigrations(db, oldVersion, newVersion ?? CURRENT_VERSION);
    },
    blocked() {
      console.warn("[local-db] Database upgrade blocked by another tab");
    },
    blocking() {
      dbInstance?.close();
      dbInstance = null;
    },
    terminated() {
      dbInstance = null;
    },
  });

  return dbInstance;
}

/**
 * Close the database connection.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Get a single record by key from a store.
 */
export async function get<S extends StoreNames<KspPosDB>>(
  storeName: S,
  key: string
): Promise<any> {
  const db = await openDatabase();
  return db.get(storeName, key);
}

/**
 * Put (upsert) a record into a store.
 */
export async function put<S extends StoreNames<KspPosDB>>(
  storeName: S,
  value: any
): Promise<string> {
  const db = await openDatabase();
  return db.put(storeName, value) as Promise<string>;
}

/**
 * Delete a record by key from a store.
 */
export async function del<S extends StoreNames<KspPosDB>>(
  storeName: S,
  key: string
): Promise<void> {
  const db = await openDatabase();
  return db.delete(storeName, key);
}

/**
 * Get all records from a store.
 */
export async function getAll<S extends StoreNames<KspPosDB>>(
  storeName: S
): Promise<any[]> {
  const db = await openDatabase();
  return db.getAll(storeName);
}

/**
 * Get all records matching an index value.
 */
export async function getAllByIndex<S extends StoreNames<KspPosDB>>(
  storeName: S,
  indexName: string,
  value: IDBValidKey
): Promise<any[]> {
  const db = await openDatabase();
  return db.getAllFromIndex(storeName, indexName, value);
}

/**
 * Query records from a store using an index with an IDBKeyRange.
 */
export async function query<S extends StoreNames<KspPosDB>>(
  storeName: S,
  options?: {
    indexName?: string;
    range?: IDBKeyRange;
    direction?: IDBCursorDirection;
    limit?: number;
    offset?: number;
  }
): Promise<any[]> {
  const db = await openDatabase();
  const { indexName, range, direction = "next", limit, offset = 0 } = options ?? {};

  const tx = db.transaction(storeName, "readonly");
  const source = indexName ? tx.store.index(indexName) : tx.store;
  let cursor = await source.openCursor(range, direction);

  const results: any[] = [];
  let skipped = 0;

  while (cursor) {
    if (skipped < offset) {
      skipped++;
      cursor = await cursor.continue();
      continue;
    }
    if (limit !== undefined && results.length >= limit) break;
    results.push(cursor.value);
    cursor = await cursor.continue();
  }

  await tx.done;
  return results;
}

/**
 * Count records in a store, optionally filtered by index.
 */
export async function count<S extends StoreNames<KspPosDB>>(
  storeName: S,
  indexName?: string,
  _range?: IDBKeyRange
): Promise<number> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, "readonly");
  const source = indexName ? tx.store.index(indexName) : tx.store;
  const result = await source.count(range);
  await tx.done;
  return result;
}

/**
 * Clear all records from a store.
 */
export async function clear<S extends StoreNames<KspPosDB>>(
  storeName: S
): Promise<void> {
  const db = await openDatabase();
  return db.clear(storeName);
}

/**
 * Perform a batch operation within a single transaction.
 */
export async function batch<S extends StoreNames<KspPosDB>>(
  storeName: S,
  mode: "readonly" | "readwrite",
  callback: (
    tx: IDBPTransaction<KspPosDB, [S], typeof mode>,
    store: IDBPTransaction<KspPosDB, [S], typeof mode>["objectStoreNames"] extends never
      ? never
      : ReturnType<IDBPTransaction<KspPosDB, [S], typeof mode>["objectStore"]>
  ) => Promise<void>
): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  await callback(tx, store as never);
  await tx.done;
}
