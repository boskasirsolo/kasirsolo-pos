/**
 * KspTransaction represents a financial transaction (payment, refund, etc.).
 * Table: ksp_transactions
 */
export interface KspTransaction {
  /** UUID primary key */
  id: string;
  /** FK to ksp_clients.id */
  client_id: string;
  /** FK to ksp_licenses.id (null if not license-related) */
  license_id: string | null;
  /** Transaction type */
  type: KspTransactionType;
  /** Amount in IDR */
  amount: number;
  /** Payment method */
  payment_method: string;
  /** Payment gateway reference/ID */
  payment_ref: string | null;
  /** Transaction status */
  status: KspTransactionStatus;
  /** Human-readable description */
  description: string | null;
  /** JSONB metadata (gateway response, invoice data, etc.) */
  metadata: Record<string, unknown> | null;
  /** Verification token for payment callbacks */
  verification_token: string | null;
  /** When the payment was verified */
  verified_at: string | null;
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

export type KspTransactionType =
  | "purchase"
  | "renewal"
  | "upgrade"
  | "refund"
  | "addon";

export type KspTransactionStatus =
  | "pending"
  | "paid"
  | "verified"
  | "failed"
  | "refunded"
  | "cancelled";

export type KspTransactionInsert = Omit<KspTransaction, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KspTransactionUpdate = Partial<Omit<KspTransaction, "id" | "created_at">>;
