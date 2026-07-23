/**
 * KspApp represents a product/application offered by KASIRSOLO.
 * Table: ksp_apps
 */
export interface KspApp {
  /** UUID primary key */
  id: string;
  /** Unique short code (e.g. "kasir", "inventory", "laundry") */
  code: string;
  /** Display name of the application */
  name: string;
  /** Icon identifier or URL */
  icon: string | null;
  /** Base price in IDR */
  price: number;
  /** Current availability status */
  status: KspAppStatus;
  /** Current version string (e.g. "1.0.0") */
  version: string;
  /** Number of trial days offered */
  trial_days: number;
  /** Number of extended trial days */
  extended_days: number;
  /** Default max devices per license */
  max_devices_default: number;
  /** JSONB list of features included */
  features: KspAppFeature[];
  /** Target market/audience */
  target: string | null;
  /** Application category */
  category: KspAppCategory;
  /** Record creation timestamp */
  created_at: string;
}

export type KspAppStatus = "active" | "coming_soon" | "deprecated" | "maintenance";

export type KspAppCategory =
  | "pos"
  | "inventory"
  | "service"
  | "fnb"
  | "retail"
  | "management"
  | "utility";

export interface KspAppFeature {
  /** Feature key identifier */
  key: string;
  /** Human-readable label */
  label: string;
  /** Whether this feature is included */
  included: boolean;
}

export type KspAppInsert = Omit<KspApp, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type KspAppUpdate = Partial<Omit<KspApp, "id" | "created_at">>;
