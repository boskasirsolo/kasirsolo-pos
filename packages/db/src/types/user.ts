/**
 * KspUser represents a user account associated with a license.
 * Table: ksp_users
 */
export interface KspUser {
  /** UUID primary key (matches Supabase auth.users.id) */
  id: string;
  /** FK to ksp_licenses.id */
  license_id: string;
  /** User email address */
  email: string;
  /** User role within the license scope */
  role: KspUserRole;
  /** Display name */
  display_name: string | null;
  /** Whether this user account is active */
  is_active: boolean;
  /** Record creation timestamp */
  created_at: string;
  /** Last login timestamp */
  last_login_at: string | null;
}

export type KspUserRole = "owner" | "admin" | "cashier" | "viewer";

export type KspUserInsert = Omit<KspUser, "created_at"> & {
  created_at?: string;
};

export type KspUserUpdate = Partial<Omit<KspUser, "id" | "created_at">>;
