export interface KspApp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  version: string;
  is_active: boolean;
  pricing: AppPricing;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface AppPricing {
  basic: number;
  pro: number;
  enterprise: number;
  lifetime: number;
}

export interface AppWithStats extends KspApp {
  total_licenses: number;
  active_licenses: number;
}
