import { getSupabase } from "./supabase";
import { getLicenseByKey, getLicenseById } from "@kasirsolo/db";
import type { KspLicense } from "@kasirsolo/db";

const LICENSE_CACHE_KEY = "kasirsolo_license_cache";
const TRIAL_START_KEY = "kasirsolo_trial_start";
const TRIAL_CLIENT_ID_KEY = "kasirsolo_trial_client_id";
const TRIAL_DAYS = 7;
const MAX_DEVICES = 2;
const PRICE = 250000;

/**
 * Verify trial expiry against the server.
 * Falls back to localStorage if server is unavailable (offline).
 */
export async function checkTrialExpiryServer(clientId: string): Promise<{ expired: boolean; daysLeft: number }> {
  try {
    const res = await fetch("/api/trial/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!res.ok) {
      return checkTrialExpiryClientSide();
    }

    const data = await res.json();
    if (data.error) {
      return checkTrialExpiryClientSide();
    }

    return {
      expired: data.expired,
      daysLeft: data.daysLeft,
    };
  } catch {
    return checkTrialExpiryClientSide();
  }
}

/**
 * Fallback: check trial using only localStorage (for offline mode).
 */
function checkTrialExpiryClientSide(): { expired: boolean; daysLeft: number } {
  const trialStart = localStorage.getItem(TRIAL_START_KEY);
  if (!trialStart) {
    return { expired: false, daysLeft: TRIAL_DAYS };
  }

  const start = new Date(trialStart);
  const now = new Date();
  const elapsed = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysLeft = Math.max(0, TRIAL_DAYS - elapsed);

  return { expired: daysLeft <= 0, daysLeft };
}

export interface LicenseStatus {
  valid: boolean;
  type: "trial" | "licensed" | "expired" | "none";
  license: KspLicense | null;
  trialDaysLeft: number;
  maxDevices: number;
  message: string;
}

/**
 * Validate a license key against Supabase.
 */
export async function validateLicense(licenseKey: string): Promise<KspLicense> {
  const supabase = getSupabase();
  const license = await getLicenseByKey(supabase, licenseKey);

  if (!license) {
    throw new Error("Kode lisensi tidak ditemukan");
  }

  if (license.status === "revoked") {
    throw new Error("Lisensi telah dicabut. Hubungi support.");
  }

  if (license.status === "suspended") {
    throw new Error("Lisensi ditangguhkan. Hubungi support.");
  }

  if (license.status === "expired") {
    throw new Error("Lisensi telah kadaluarsa.");
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    throw new Error("Lisensi telah kadaluarsa.");
  }

  // Cache the license data
  localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify(license));

  return license;
}

/**
 * Start a trial period. Stores timestamp + optional client_id for server verification.
 * @param clientId - Optional client UUID from DB (set by trial registration flow)
 */
export function startTrial(clientId?: string): void {
  const existing = localStorage.getItem(TRIAL_START_KEY);
  if (!existing) {
    localStorage.setItem(TRIAL_START_KEY, new Date().toISOString());
  }
  // Store client_id so checkTrialExpiry can verify against server
  if (clientId) {
    localStorage.setItem(TRIAL_CLIENT_ID_KEY, clientId);
  }
}

/**
 * Check if the trial has expired.
 * Priority: server-side verification > localStorage fallback.
 */
export async function checkTrialExpiry(): Promise<{ expired: boolean; daysLeft: number }> {
  const clientId = localStorage.getItem(TRIAL_CLIENT_ID_KEY);

  if (clientId) {
    return checkTrialExpiryServer(clientId);
  }

  return checkTrialExpiryClientSide();
}

/**
 * Get the overall license status for the current device/user.
 */
export async function getLicenseStatus(): Promise<LicenseStatus> {
  // Check for cached license
  const cached = localStorage.getItem(LICENSE_CACHE_KEY);
  if (cached) {
    try {
      const license = JSON.parse(cached) as KspLicense;

      // Try to refresh from server
      try {
        const supabase = getSupabase();
        const fresh = await getLicenseById(supabase, license.id);
        if (fresh) {
          localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify(fresh));

          if (fresh.status === "active") {
            return {
              valid: true,
              type: fresh.plan_type === "trial" ? "trial" : "licensed",
              license: fresh,
              trialDaysLeft: 0,
              maxDevices: fresh.max_devices,
              message: "Lisensi aktif",
            };
          }

          return {
            valid: false,
            type: "expired",
            license: fresh,
            trialDaysLeft: 0,
            maxDevices: fresh.max_devices,
            message: "Lisensi tidak aktif",
          };
        }
      } catch {
        // Offline - use cached data
        if (license.status === "active") {
          return {
            valid: true,
            type: license.plan_type === "trial" ? "trial" : "licensed",
            license,
            trialDaysLeft: 0,
            maxDevices: license.max_devices,
            message: "Lisensi aktif (offline)",
          };
        }
      }
    } catch {
      // Invalid cache, fall through
    }
  }

  // Check trial — now server-verified via checkTrialExpiry() (async)
  const trial = await checkTrialExpiry();
  const trialStart = localStorage.getItem(TRIAL_START_KEY);

  if (trialStart) {
    if (trial.expired) {
      return {
        valid: false,
        type: "expired",
        license: null,
        trialDaysLeft: 0,
        maxDevices: MAX_DEVICES,
        message: "Masa trial telah berakhir. Silakan beli lisensi.",
      };
    }

    return {
      valid: true,
      type: "trial",
      license: null,
      trialDaysLeft: trial.daysLeft,
      maxDevices: MAX_DEVICES,
      message: `Trial: ${trial.daysLeft} hari tersisa`,
    };
  }

  return {
    valid: false,
    type: "none",
    license: null,
    trialDaysLeft: 0,
    maxDevices: MAX_DEVICES,
    message: "Belum diaktivasi",
  };
}

export { TRIAL_DAYS, MAX_DEVICES, PRICE };
