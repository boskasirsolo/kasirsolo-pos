import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  KspTransaction,
  KspTransactionInsert,
  KspTransactionUpdate,
  KspTransactionStatus,
} from "../types/transaction";

/**
 * Fetch transactions with optional filtering.
 */
export async function getTransactions(
  supabase: SupabaseClient,
  options?: {
    clientId?: string;
    licenseId?: string;
    status?: KspTransactionStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: KspTransaction[]; count: number }> {
  const { clientId, licenseId, status, limit = 50, offset = 0 } = options ?? {};

  let query = supabase
    .from("ksp_transactions")
    .select("*", { count: "exact" });

  if (clientId) query = query.eq("client_id", clientId);
  if (licenseId) query = query.eq("license_id", licenseId);
  if (status) query = query.eq("status", status);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspTransaction[], count: count ?? 0 };
}

/**
 * Get a single transaction by ID.
 */
export async function getTransactionById(
  supabase: SupabaseClient,
  transactionId: string
): Promise<KspTransaction | null> {
  const { data, error } = await supabase
    .from("ksp_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspTransaction) ?? null;
}

/**
 * Create a new transaction record.
 */
export async function createTransaction(
  supabase: SupabaseClient,
  transaction: KspTransactionInsert
): Promise<KspTransaction> {
  const { data, error } = await supabase
    .from("ksp_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data as KspTransaction;
}

/**
 * Update a transaction record.
 */
export async function updateTransaction(
  supabase: SupabaseClient,
  transactionId: string,
  updates: KspTransactionUpdate
): Promise<KspTransaction> {
  const { data, error } = await supabase
    .from("ksp_transactions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select()
    .single();

  if (error) throw error;
  return data as KspTransaction;
}

/**
 * Verify a transaction by its verification token.
 * Transitions status from "paid" to "verified".
 */
export async function verifyTransaction(
  supabase: SupabaseClient,
  transactionId: string,
  verificationToken: string
): Promise<KspTransaction> {
  const { data, error } = await supabase
    .from("ksp_transactions")
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId)
    .eq("verification_token", verificationToken)
    .eq("status", "paid")
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Transaction verification failed: invalid token or status");
  return data as KspTransaction;
}
