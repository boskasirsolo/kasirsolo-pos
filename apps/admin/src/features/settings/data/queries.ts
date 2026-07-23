import { SupabaseClient } from "@supabase/supabase-js";
import type { BusinessSettings, BankSettings, TrialConfig, SecuritySettings, WATemplate } from "./types";

const SETTINGS_TABLE = "ksp_settings";

async function getSetting<T>(supabase: SupabaseClient, key: string, fallback: T): Promise<T> {
  const { data } = await supabase
    .from(SETTINGS_TABLE)
    .select("value")
    .eq("key", key)
    .single();

  return data?.value ?? fallback;
}

async function setSetting<T>(supabase: SupabaseClient, key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from(SETTINGS_TABLE)
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) throw new Error(error.message);
}

export async function getBusinessSettings(supabase: SupabaseClient): Promise<BusinessSettings> {
  return getSetting(supabase, "business", {
    business_name: "PT Mesin Kasir Solo",
    owner_name: "",
    phone: "",
    email: "owner.kasirsolo@gmail.com",
    address: "",
    logo_url: null,
  });
}

export async function saveBusinessSettings(supabase: SupabaseClient, settings: BusinessSettings): Promise<void> {
  return setSetting(supabase, "business", settings);
}

export async function getBankSettings(supabase: SupabaseClient): Promise<BankSettings> {
  return getSetting(supabase, "bank", {
    bank_name: "",
    account_number: "",
    account_holder: "",
    bank_code: "",
  });
}

export async function saveBankSettings(supabase: SupabaseClient, settings: BankSettings): Promise<void> {
  return setSetting(supabase, "bank", settings);
}

export async function getTrialConfig(supabase: SupabaseClient): Promise<TrialConfig> {
  return getSetting(supabase, "trial_config", {
    trial_duration_days: 7,
    max_extend_count: 1,
    extend_duration_days: 7,
    auto_lock_after_days: 3,
    auto_lock_enabled: true,
  });
}

export async function saveTrialConfig(supabase: SupabaseClient, config: TrialConfig): Promise<void> {
  return setSetting(supabase, "trial_config", config);
}

export async function getSecuritySettings(supabase: SupabaseClient): Promise<SecuritySettings> {
  return getSetting(supabase, "security", {
    require_2fa: false,
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    allowed_ips: [],
  });
}

export async function saveSecuritySettings(supabase: SupabaseClient, settings: SecuritySettings): Promise<void> {
  return setSetting(supabase, "security", settings);
}

export async function getWATemplates(supabase: SupabaseClient): Promise<WATemplate[]> {
  return getSetting(supabase, "wa_templates", [
    {
      id: "welcome",
      name: "Selamat Datang",
      template: "Halo {{name}}, terima kasih telah mendaftar KASIRSOLO! Kode aplikasi Anda: {{app_code}}. Trial Anda berlaku sampai {{trial_expires}}.",
      description: "Dikirim saat klien pertama kali mendaftar trial",
    },
    {
      id: "trial_expiring",
      name: "Trial Segera Habis",
      template: "Halo {{name}}, trial KASIRSOLO Anda akan berakhir dalam {{days_left}} hari. Upgrade sekarang untuk melanjutkan layanan!",
      description: "Dikirim ketika trial akan segera berakhir",
    },
    {
      id: "activation",
      name: "Aktivasi Lisensi",
      template: "Halo {{name}}, berikut activation key KASIRSOLO Anda:\n\n*{{license_key}}*\n\nMasukkan key ini di aplikasi untuk mengaktifkan. Terima kasih!",
      description: "Dikirim setelah pembayaran diverifikasi",
    },
    {
      id: "payment_reminder",
      name: "Pengingat Pembayaran",
      template: "Halo {{name}}, kami belum menerima pembayaran Anda. Silakan transfer ke:\n\n{{bank_info}}\n\nSebesar: {{amount}}\n\nKonfirmasi setelah transfer ya!",
      description: "Dikirim untuk mengingatkan pembayaran",
    },
  ]);
}

export async function saveWATemplates(supabase: SupabaseClient, templates: WATemplate[]): Promise<void> {
  return setSetting(supabase, "wa_templates", templates);
}
