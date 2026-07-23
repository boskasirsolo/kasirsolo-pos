import { get, put, del, getAll, getAllByIndex, query, count } from "../engine";
import type { PosProduct, SyncStatus } from "../types/product";

/**
 * Get all products, optionally filtered.
 */
export async function getProducts(options?: {
  categoryId?: string;
  activeOnly?: boolean;
  search?: string;
}): Promise<PosProduct[]> {
  let products: PosProduct[];

  if (options?.categoryId) {
    products = await getAllByIndex("products", "by-category", options.categoryId);
  } else {
    products = await getAll("products");
  }

  if (options?.activeOnly) {
    products = products.filter((p) => p.is_active);
  }

  if (options?.search) {
    const term = options.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term))
    );
  }

  return products;
}

/**
 * Get a single product by ID.
 */
export async function getProductById(id: string): Promise<PosProduct | undefined> {
  return get("products", id);
}

/**
 * Get a product by its barcode.
 */
export async function getProductByBarcode(barcode: string): Promise<PosProduct | undefined> {
  const results = await getAllByIndex("products", "by-barcode", barcode);
  return results[0];
}

/**
 * Create or update a product.
 */
export async function saveProduct(
  product: PosProduct
): Promise<string> {
  const now = new Date().toISOString();
  const existing = await get("products", product.id);

  const record: PosProduct = {
    ...product,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    sync_status: "pending" as SyncStatus,
  };

  return put("products", record);
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string): Promise<void> {
  return del("products", id);
}

/**
 * Get products with low stock.
 */
export async function getLowStockProducts(threshold?: number): Promise<PosProduct[]> {
  const products = await getAll("products");
  return products.filter((p) => {
    if (!p.track_stock || !p.is_active) return false;
    const limit = threshold ?? p.min_stock;
    return p.stock <= limit;
  });
}

/**
 * Update product stock.
 */
export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<PosProduct> {
  const product = await get("products", productId);
  if (!product) throw new Error(`Product not found: ${productId}`);

  const updated: PosProduct = {
    ...product,
    stock: newStock,
    updated_at: new Date().toISOString(),
    sync_status: "pending",
  };

  await put("products", updated);
  return updated;
}

/**
 * Count total products.
 */
export async function countProducts(): Promise<number> {
  return count("products");
}

/**
 * Search products by name (using cursor for efficiency on large datasets).
 */
export async function searchProducts(
  term: string,
  options?: { limit?: number }
): Promise<PosProduct[]> {
  const allProducts = await query("products", {
    indexName: "by-name",
    limit: options?.limit ?? 50,
  });

  const lowerTerm = term.toLowerCase();
  return allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerTerm) ||
      (p.barcode && p.barcode.toLowerCase().includes(lowerTerm))
  );
}
