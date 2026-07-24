import { getSupabase } from './supabase';
import { getLicenseByKey, getLicenseById } from '@kasirsolo/db';
import type { KspLicense } from '@kasirsolo/db';

export interface LicenseConfig {
  /** Full prefix for localStorage keys (FNB: "kasirsolo_fnb_", Retail: "kasirsolo_") */
  storageKeyPrefix: string;
  /** License price in IDR (FNB: 350000, Retail: 250000) */
  price: number;
}

const DEFAULT_CONFIG: Required<LicenseConfig> = {
  storageKeyPrefix: 'kasirsolo_',
  price: 250000,
};

const TRIAL_DAYS = 7;
const MAX_DEVICES = 2;

function getConfig(config?: LicenseConfig): Required<LicenseConfig> {
  return { ...DEFAULT_CONFIG, ...config };
}

function keys(cfg: Required<LicenseConfig>) {
  const p = cfg.storageKeyPrefix;
  return {
    licenseCacheKey: `${p}license_cache`,
    trialStartKey: `${p}trial_start`,
  };
}

export interface LicenseStatus {
  valid: boolean;
  type: 'trial' | 'licensed' | 'expired' | 'none';
  license: KspLicense | null;
  trialDaysLeft: number;
  maxDevices: number;
  message: string;
}

/**
 * Validate a license key against Supabase.
 */
export async function validateLicense(
  licenseKey: string,
  config?: LicenseConfig,
): Promise<KspLicense> {
  const cfg = getConfig(config);
  const k = keys(cfg);
  const supabase = getSupabase();
  const license = await getLicenseByKey(supabase, licenseKey);

  if (!license) {
    throw new Error('Kode lisensi tidak ditemukan');
  }

  if (license.status === 'revoked') {
    throw new Error('Lisensi telah dicabut. Hubungi support.');
  }

  if (license.status === 'suspended') {
    throw new Error('Lisensi ditangguhkan. Hubungi support.');
  }

  if (license.status === 'expired') {
    throw new Error('Lisensi telah kadaluarsa.');
  }

  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    throw new Error('Lisensi telah kadaluarsa.');
  }

  // Cache the license data
  localStorage.setItem(k.licenseCacheKey, JSON.stringify(license));

  return license;
}

/**
 * Start a trial period.
 */
export function startTrial(config?: LicenseConfig): void {
  const cfg = getConfig(config);
  const k = keys(cfg);
  const existing = localStorage.getItem(k.trialStartKey);
  if (!existing) {
    localStorage.setItem(k.trialStartKey, new Date().toISOString());
  }
}

/**
 * Check if the trial has expired.
 */
export function checkTrialExpiry(config?: LicenseConfig): {
  expired: boolean;
  daysLeft: number;
} {
  const cfg = getConfig(config);
  const k = keys(cfg);
  const trialStart = localStorage.getItem(k.trialStartKey);
  if (!trialStart) {
    return { expired: false, daysLeft: TRIAL_DAYS };
  }

  const start = new Date(trialStart);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DAYS - elapsed);

  return { expired: daysLeft <= 0, daysLeft };
}

/**
 * Get the overall license status for the current device/user.
 */
export async function getLicenseStatus(config?: LicenseConfig): Promise<LicenseStatus> {
  const cfg = getConfig(config);
  const k = keys(cfg);

  // Check for cached license
  const cached = localStorage.getItem(k.licenseCacheKey);
  if (cached) {
    try {
      const license = JSON.parse(cached) as KspLicense;

      // Try to refresh from server
      try {
        const supabase = getSupabase();
        const fresh = await getLicenseById(supabase, license.id);
        if (fresh) {
          localStorage.setItem(k.licenseCacheKey, JSON.stringify(fresh));

          if (fresh.status === 'active') {
            return {
              valid: true,
              type: fresh.plan_type === 'trial' ? 'trial' : 'licensed',
              license: fresh,
              trialDaysLeft: 0,
              maxDevices: fresh.max_devices,
              message: 'Lisensi aktif',
            };
          }

          return {
            valid: false,
            type: 'expired',
            license: fresh,
            trialDaysLeft: 0,
            maxDevices: fresh.max_devices,
            message: 'Lisensi tidak aktif',
          };
        }
      } catch {
        // Offline - use cached data
        if (license.status === 'active') {
          return {
            valid: true,
            type: license.plan_type === 'trial' ? 'trial' : 'licensed',
            license,
            trialDaysLeft: 0,
            maxDevices: license.max_devices,
            message: 'Lisensi aktif (offline)',
          };
        }
      }
    } catch {
      // Invalid cache, fall through
    }
  }

  // Check trial
  const trial = checkTrialExpiry(cfg);
  const trialStart = localStorage.getItem(k.trialStartKey);

  if (trialStart) {
    if (trial.expired) {
      return {
        valid: false,
        type: 'expired',
        license: null,
        trialDaysLeft: 0,
        maxDevices: MAX_DEVICES,
        message: 'Masa trial telah berakhir. Silakan beli lisensi.',
      };
    }

    return {
      valid: true,
      type: 'trial',
      license: null,
      trialDaysLeft: trial.daysLeft,
      maxDevices: MAX_DEVICES,
      message: `Trial: ${trial.daysLeft} hari tersisa`,
    };
  }

  return {
    valid: false,
    type: 'none',
    license: null,
    trialDaysLeft: 0,
    maxDevices: MAX_DEVICES,
    message: 'Belum diaktivasi',
  };
}

// Re-export constants and config defaults
export { TRIAL_DAYS, MAX_DEVICES };

/** Default price in IDR (overridden by config.price per app) */
export const PRICE = DEFAULT_CONFIG.price;
