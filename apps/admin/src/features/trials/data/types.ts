export type TrialTab = "active" | "expiring" | "expired" | "extended" | "locked";

export interface TrialClient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  app_code: string;
  status: string;
  trial_started: string | null;
  trial_expires: string | null;
  trial_extended: boolean;
  source: string | null;
  created_at: string;
  days_left: number | null;
}

export interface TrialStats {
  active: number;
  expiring: number;
  expired: number;
  extended: number;
  locked: number;
}
