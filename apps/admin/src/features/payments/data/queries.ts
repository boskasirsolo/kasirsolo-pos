import { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentFilter, PaymentWithClient, PaymentStatus } from "./types";

export async function getPayments(
  supabase: SupabaseClient,
  filter: PaymentFilter
): Promise<{ data: PaymentWithClient[]; total: number }> {
  let query = supabase
    .from("ksp_payments")
    .select("*, ksp_clients(name, phone)", { count: "exact" });

  if (filter.status !== "all") {
    query = query.eq("status", filter.status);
  }

  if (filter.search) {
    query = query.or(`method.ilike.%${filter.search}%,notes.ilike.%${filter.search}%`);
  }

  const from = (filter.page - 1) * filter.perPage;
  query = query
    .order("created_at", { ascending: false })
    .range(from, from + filter.perPage - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const payments: PaymentWithClient[] = (data ?? []).map((p) => {
    const rec = p as Record<string, unknown>;
    return {
      ...p,
      client_name: rec.ksp_clients
        ? (rec.ksp_clients as { name: string }).name
        : undefined,
      client_phone: rec.ksp_clients
        ? (rec.ksp_clients as { phone: string }).phone
        : undefined,
    };
  });

  return { data: payments, total: count ?? 0 };
}

export async function updatePaymentStatus(
  supabase: SupabaseClient,
  paymentId: string,
  status: PaymentStatus,
  verifiedBy?: string
): Promise<void> {
  const updates: Record<string, unknown> = { status };
  if (status === "verified") {
    updates.verified_at = new Date().toISOString();
    updates.verified_by = verifiedBy ?? null;
  }

  const { error } = await supabase
    .from("ksp_payments")
    .update(updates)
    .eq("id", paymentId);

  if (error) throw new Error(error.message);
}
