/**
 * Device binding module for KASIRSOLO apps.
 * Parameterized with app-specific localStorage key prefix.
 */

import {
  createBrowserClient,
  getDeviceByFingerprint,
  bindDevice,
  countActiveDevices,
  touchDevice,
  getDevices,
  unbindDevice,
} from '@kasirsolo/db';
import type { KspDevice } from '@kasirsolo/db';
import { generateFingerprint, getDeviceId } from '@kasirsolo/utils';
import type { AuthConfig } from './license';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeviceInfo {
  deviceId: string;
  fingerprint: string;
  deviceName: string;
  boundDevice: KspDevice | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function makeKey(key: string, prefix: string): string {
  return `${prefix}_${key}`;
}

function buildDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Unknown Device';

  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'Mac';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} - ${os}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get info about the current device. */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const deviceId = getDeviceId();
  const fingerprint = await generateFingerprint();
  const deviceName = buildDeviceName();

  return {
    deviceId,
    fingerprint,
    deviceName,
    boundDevice: null,
  };
}

/** Check whether this device is bound to a license. */
export async function checkDeviceBinding(
  configOverride?: AuthConfig,
): Promise<{ bound: boolean; device: KspDevice | null; licenseId: string | null }> {
  const cfg = getConfig(configOverride);
  const licenseId = localStorage.getItem(makeKey('license_id', cfg.prefix));
  if (!licenseId) {
    return { bound: false, device: null, licenseId: null };
  }

  try {
    const supabase = getClient();
    const fingerprint = await generateFingerprint();
    const device = await getDeviceByFingerprint(supabase, licenseId, fingerprint);

    if (device && device.is_active) {
      // Touch to update last_seen_at
      touchDevice(supabase, device.id).catch(() => {});
      return { bound: true, device, licenseId };
    }

    return { bound: false, device: null, licenseId };
  } catch {
    // If offline, check local storage for cached binding
    const cached = localStorage.getItem(makeKey('device_info', cfg.prefix));
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as KspDevice;
        return { bound: true, device: parsed, licenseId };
      } catch {
        return { bound: false, device: null, licenseId };
      }
    }
    return { bound: false, device: null, licenseId };
  }
}

/** Activate (bind) this device to a license. */
export async function activateDevice(
  licenseId: string,
  maxDevices: number,
  configOverride?: AuthConfig,
): Promise<KspDevice> {
  const cfg = getConfig(configOverride);
  const supabase = getClient();
  const fingerprint = await generateFingerprint();
  const deviceName = buildDeviceName();

  // Check if already bound
  const existing = await getDeviceByFingerprint(supabase, licenseId, fingerprint);
  if (existing && existing.is_active) {
    cacheDevice(existing, licenseId, cfg);
    return existing;
  }

  // Check device slot availability
  const activeCount = await countActiveDevices(supabase, licenseId);
  if (activeCount >= maxDevices) {
    throw new Error(
      `Batas perangkat tercapai (${maxDevices} perangkat). Lepas salah satu perangkat untuk melanjutkan.`,
    );
  }

  // Bind new device
  const device = await bindDevice(supabase, {
    license_id: licenseId,
    fingerprint,
    device_name: deviceName,
    device_number: activeCount + 1,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  });

  cacheDevice(device, licenseId, cfg);
  return device;
}

/** Get all devices bound to the current license. */
export async function getLicenseDevices(configOverride?: AuthConfig): Promise<KspDevice[]> {
  const cfg = getConfig(configOverride);
  const licenseId = localStorage.getItem(makeKey('license_id', cfg.prefix));
  if (!licenseId) return [];

  const supabase = getClient();
  return getDevices(supabase, licenseId);
}

/** Unbind a device from the license. */
export async function removeDevice(deviceId: string): Promise<void> {
  const supabase = getClient();
  await unbindDevice(supabase, deviceId);
}

/** Store the license ID for this device. */
export function setLicenseId(licenseId: string, configOverride?: AuthConfig): void {
  const cfg = getConfig(configOverride);
  localStorage.setItem(makeKey('license_id', cfg.prefix), licenseId);
}

/** Get the stored license ID. */
export function getLicenseId(configOverride?: AuthConfig): string | null {
  const cfg = getConfig(configOverride);
  return localStorage.getItem(makeKey('license_id', cfg.prefix));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getConfig(override?: AuthConfig) {
  return {
    prefix: override?.prefix ?? 'kasirsolo_fnb', // default to FNB
  };
}

function cacheDevice(
  device: KspDevice,
  licenseId: string,
  cfg: ReturnType<typeof getConfig>,
): void {
  localStorage.setItem(makeKey('device_info', cfg.prefix), JSON.stringify(device));
  localStorage.setItem(makeKey('license_id', cfg.prefix), licenseId);
}
