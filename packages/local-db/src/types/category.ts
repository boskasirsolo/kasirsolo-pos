import type { SyncStatus } from "./product";

/**
 * PosCategory represents a product category.
 */
export interface PosCategory {
  /** UUID primary key */
  id: string;
  /** Category display name */
  name: string;
  /** Category color (hex) for UI display */
  color: string;
  /** Category icon identifier */
  icon: string | null;
  /** Sort order for display */
  sort_order: number;
  /** Whether this category is active */
  is_active: boolean;
  /** Record creation timestamp (ISO string) */
  created_at: string;
  /** Record last update timestamp (ISO string) */
  updated_at: string;
  /** Sync status with server */
  sync_status: SyncStatus;
}
