/**
 * PosSettings stores local POS configuration.
 */
export interface PosSettings {
  /** Always "settings" - singleton key */
  id: "settings";
  /** Store/business name */
  store_name: string;
  /** Store address */
  store_address: string;
  /** Store phone number */
  store_phone: string;
  /** Store logo URL or base64 */
  store_logo: string | null;
  /** Default tax percentage (e.g. 11 for PPN) */
  tax_percentage: number;
  /** Whether tax is enabled */
  tax_enabled: boolean;
  /** Tax label (e.g. "PPN") */
  tax_label: string;
  /** Currency code */
  currency: string;
  /** Receipt footer message */
  receipt_footer: string;
  /** Receipt format preference */
  receipt_format: "thermal_58mm" | "thermal_80mm" | "a4" | "digital";
  /** Whether to auto-print receipt */
  auto_print_receipt: boolean;
  /** Whether to play sound on transaction complete */
  sound_enabled: boolean;
  /** Low stock alert threshold (global default) */
  low_stock_threshold: number;
  /** Auto-sync interval in minutes (0 = manual only) */
  sync_interval: number;
  /** Last sync timestamp (ISO string) */
  last_synced_at: string | null;
  /** App theme preference */
  theme: "light" | "dark" | "system";
  /** Language preference */
  language: "id" | "en";
  /** Last updated timestamp (ISO string) */
  updated_at: string;
}

/** Default POS settings for new installations. */
export const DEFAULT_POS_SETTINGS: PosSettings = {
  id: "settings",
  store_name: "",
  store_address: "",
  store_phone: "",
  store_logo: null,
  tax_percentage: 11,
  tax_enabled: false,
  tax_label: "PPN",
  currency: "IDR",
  receipt_footer: "Terima kasih atas kunjungan Anda!",
  receipt_format: "thermal_58mm",
  auto_print_receipt: false,
  sound_enabled: true,
  low_stock_threshold: 10,
  sync_interval: 15,
  last_synced_at: null,
  theme: "light",
  language: "id",
  updated_at: new Date().toISOString(),
};
