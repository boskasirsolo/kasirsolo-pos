/**
 * KspClient represents a registered client (business) in the system.
 * Table: ksp_clients
 */
export interface KspClient {
  /** UUID primary key */
  id: string;
  /** Business or client display name */
  name: string;
  /** Primary contact phone number */
  phone: string;
  /** Contact email address */
  email: string | null;
  /** Unique app code assigned to this client (e.g. "KSP-A1B2C3") */
  app_code: string;
  /** Current client status */
  status: KspClientStatus;
  /** When the trial period started */
  trial_started: string | null;
  /** When the trial period expires */
  trial_expires: string | null;
  /** Whether the trial has been extended */
  trial_extended: boolean;
  /** Activation key used to activate the client */
  activation_key: string | null;
  /** How the client was acquired (e.g. "website", "referral", "whatsapp") */
  source: string | null;
  /** Internal notes about this client */
  notes: string | null;
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

export type KspClientStatus =
  | "trial"
  | "active"
  | "expired"
  | "locked"
  | "suspended";

export type KspClientInsert = Omit<KspClient, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KspClientUpdate = Partial<Omit<KspClient, "id" | "created_at">> & {
  updated_at?: string;
};
