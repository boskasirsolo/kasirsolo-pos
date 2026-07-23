export type SettingsTab = "business" | "bank" | "trial" | "security" | "whatsapp";

export interface BusinessSettings {
  business_name: string;
  owner_name: string;
  phone: string;
  email: string;
  address: string;
  logo_url: string | null;
}

export interface BankSettings {
  bank_name: string;
  account_number: string;
  account_holder: string;
  bank_code: string;
}

export interface TrialConfig {
  trial_duration_days: number;
  max_extend_count: number;
  extend_duration_days: number;
  auto_lock_after_days: number;
  auto_lock_enabled: boolean;
}

export interface SecuritySettings {
  require_2fa: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  allowed_ips: string[];
}

export interface WATemplate {
  id: string;
  name: string;
  template: string;
  description: string;
}
