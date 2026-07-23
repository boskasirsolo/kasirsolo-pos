export interface Payment {
  id: string;
  client_id: string;
  license_id: string | null;
  amount: number;
  method: string;
  status: PaymentStatus;
  proof_url: string | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export type PaymentStatus = "pending" | "verified" | "rejected" | "refunded";

export interface PaymentWithClient extends Payment {
  client_name?: string;
  client_phone?: string;
}

export interface PaymentFilter {
  search: string;
  status: PaymentStatus | "all";
  page: number;
  perPage: number;
}
