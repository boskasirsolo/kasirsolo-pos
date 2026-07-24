/**
 * License and trial management module for KASIRSOLO apps.
 * Parameterized with app-specific constants to share between kasir-fnb and kasir-retail.
 */

import { createBrowserClient, getLicenseByKey, getLicenseById } from '@kasirsolo/db';
import type { KspLicense } from '@kasirsolo/db';

// ---------------------------------------------------------------------------
// Configuration – override per app via the AuthConfig interface.
// ---------------------------------------------------------------------------

export interface AuthConfig {
  /** localStorage key prefix, e.g. "kasirsolo_fnb" or "kasirsolo" */
  prefix: string;
  /** Trial period in days */
  trialDays?: number;
  /** Maximum devices allowed per license */
  maxDevices?: number;
  /** Monthly price */
  price?: number;
}

const DEFAULT_CONFIG = {
  trialDays: 7,
  maxDevices: 2,
  price: 350000,
} as const;

function getConfig(override?: AuthConfig) {
  return {
    ...DEFAULT_CONFIG,
    ...override,
  };
}

type FullConfig = ReturnType<typeof getConfig> & { prefix: string };

// Lazy-loaded Supabase instance
let _client: ReturnType<typeof createBrowserClient> | null = null;

function getClient(): NonNullable<typeof _client> {
  if (!_client) {
    _client = createBrowserClient();
    if (!_client) {
      throw new Error(
        '[kasirsolo-auth] Supabase client not initialized. Check environment variables.',
      );
    }
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Derived keys (computed from prefix)
// ---------------------------------------------------------------------------

function makeKey(key: string, prefix: string): string {
  return `${prefix}_${key}`;
}

// ---------------------------------------------------------------------------
// Trial expiry
// ---------------------------------------------------------------------------

/** Verify trial expiry against the server endpoint. Falls back to localStorage. */
export async function checkTrialExpiryServer(
  clientId: string,
  configOverride?: AuthConfig,
): Promise<{ expired: boolean; daysLeft: number }> {
  const cfg = getConfig(configOverride) as FullConfig;
  try {
    const res = await fetch('/api/trial/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!res.ok) {
      return checkTrialExpiryClientSide(cfg);
    }

    const data = await res.json();
    if (data.error) {
      return checkTrialExpiryClientSide(cfg);
    }

    return {
      expired: data.expired,
      daysLeft: data.daysLeft,
    };
  } catch {
    return checkTrialExpiryClientSide(cfg);
  }
}

/** Fallback: check trial using only localStorage (for offline mode). */
function checkTrialExpiryClientSide(cfg: FullConfig): {
  expired: boolean;
  daysLeft: number;
} {
  const trialStart = localStorage.getItem(makeKey('trial_start', cfg.prefix));
  if (!trialStart) {
    return { expired: false, daysLeft: cfg.trialDays };
  }

  const start = new Date(trialStart);
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, cfg.trialDays - elapsed);

  return { expired: daysLeft <= 0, daysLeft };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LicenseStatus {
  valid: boolean;
  type: 'trial' | 'licensed' | 'expired' | 'none';
  license: KspLicense | null;
  trialDaysLeft: number;
  maxDevices: number;
  message: string;
}

// ---------------------------------------------------------------------------
// License validation
// ---------------------------------------------------------------------------

/** Validate a license key against Supabase. */
export async function validateLicense(
  licenseKey: string,
  configOverride?: AuthConfig,
): Promise<KspLicense> {
  const cfg = getConfig(configOverride) as FullConfig;
  const supabase = getClient();
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
  localStorage.setItem(makeKey('license_cache', cfg.prefix), JSON.stringify(license));

  return license;
}

// ---------------------------------------------------------------------------
// Trial start
// ---------------------------------------------------------------------------

/**
 * Start a trial period. Stores timestamp + optional client_id for server verification.
 * @param clientId - Optional client UUID from DB (set by trial registration flow)
 */
export function startTrial(clientId?: string, configOverride?: AuthConfig): void {
  const cfg = getConfig(configOverride) as FullConfig;
  const existing = localStorage.getItem(makeKey('trial_start', cfg.prefix));
  if (!existing) {
    localStorage.setItem(makeKey('trial_start', cfg.prefix), new Date().toISOString());
  }
  // Store client_id so checkTrialExpiry can verify against server
  if (clientId) {
    localStorage.setItem(makeKey('trial_client_id', cfg.prefix), clientId);
  }
}

// ---------------------------------------------------------------------------
// Trial expiry check (main entry-point)
// ---------------------------------------------------------------------------

/**
 * Check if the trial has expired.
 * Priority: server-side verification > localStorage fallback.
 */
export async function checkTrialExpiry(
  configOverride?: AuthConfig,
): Promise<{ expired: boolean; daysLeft: number }> {
  const cfg = getConfig(configOverride) as FullConfig;
  const clientId = localStorage.getItem(makeKey('trial_client_id', cfg.prefix));

  // If we have a client_id from DB, verify against server first
  if (clientId) {
    return checkTrialExpiryServer(clientId, configOverride);
  }

  // No DB record — pure localStorage trial
  const trialStart = localStorage.getItem(makeKey('trial_start', cfg.prefix));
  if (!trialStart) {
    return { expired: false, daysLeft: cfg.trialDays };
  }

  return checkTrialExpiryClientSide(cfg);
}

// ---------------------------------------------------------------------------
// Overall license status
// ---------------------------------------------------------------------------

/** Get the overall license status for the current device/user. */
export async function getLicenseStatus(configOverride?: AuthConfig): Promise<LicenseStatus> {
  const cfg = getConfig(configOverride) as FullConfig;

  // Check for cached license
  const cached = localStorage.getItem(makeKey('license_cache', cfg.prefix));
  if (cached) {
    try {
      const license = JSON.parse(cached) as KspLicense;

      // Try to refresh from server
      try {
        const supabase = getClient();
        const fresh = await getLicenseById(supabase, license.id);
        if (fresh) {
          localStorage.setItem(makeKey('license_cache', cfg.prefix), JSON.stringify(fresh));

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

  // Check trial — server-verified
  const trial = await checkTrialExpiry(configOverride);
  const trialStart = localStorage.getItem(makeKey('trial_start', cfg.prefix));

  if (trialStart) {
    if (trial.expired) {
      return {
        valid: false,
        type: 'expired',
        license: null,
        trialDaysLeft: 0,
        maxDevices: cfg.maxDevices,
        message: 'Masa trial telah berakhir. Silakan beli lisensi.',
      };
    }

    return {
      valid: true,
      type: 'trial',
      license: null,
      trialDaysLeft: trial.daysLeft,
      maxDevices: cfg.maxDevices,
      message: `Trial: ${trial.daysLeft} hari tersisa`,
    };
  }

  return {
    valid: false,
    type: 'none',
    license: null,
    trialDaysLeft: 0,
    maxDevices: cfg.maxDevices,
    message: 'Belum diaktivasi',
  };
}

// ---------------------------------------------------------------------------
// Constants (re-exported for convenience)
// ---------------------------------------------------------------------------

/** Default trial days. */
export const TRIAL_DAYS = DEFAULT_CONFIG.trialDays;
/** Default maximum devices. */
export const MAX_DEVICES = DEFAULT_CONFIG.maxDevices;
/** Default price. Override per app at call-site if needed. */
export const PRICE = DEFAULT_CONFIG.price;
