/**
 * KspDevice represents a registered device bound to a license.
 * Table: ksp_devices
 */
export interface KspDevice {
  /** UUID primary key */
  id: string;
  /** FK to ksp_licenses.id */
  license_id: string;
  /** Unique browser/device fingerprint */
  fingerprint: string;
  /** Human-readable device name (e.g. "Kasir 1 - Chrome Windows") */
  device_name: string | null;
  /** Device slot number within the license (1, 2, 3...) */
  device_number: number;
  /** When this device was first activated */
  activated_at: string;
  /** Last time this device was seen online */
  last_seen_at: string | null;
  /** Whether this device binding is currently active */
  is_active: boolean;
}

export type KspDeviceInsert = Omit<KspDevice, "id" | "activated_at"> & {
  id?: string;
  activated_at?: string;
};

export type KspDeviceUpdate = Partial<Omit<KspDevice, "id" | "license_id" | "activated_at">>;
