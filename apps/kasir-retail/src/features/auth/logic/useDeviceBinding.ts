'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  checkDeviceBinding,
  activateDevice,
  getLicenseDevices,
  removeDevice,
  setLicenseId,
  getDeviceInfo,
  type DeviceInfo,
} from '@kasirsolo/auth/device';
import { validateLicense, startTrial } from '@kasirsolo/auth/license';
import type { KspDevice } from '@kasirsolo/db';

// App-specific auth config
const AUTH_CONFIG = { prefix: 'kasirsolo' };

export function useDeviceBinding() {
  const [bound, setBound] = useState(false);
  const [device, setDevice] = useState<KspDevice | null>(null);
  const [devices, setDevices] = useState<KspDevice[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const result = await checkDeviceBinding(AUTH_CONFIG);
      setBound(result.bound);
      setDevice(result.device);

      const info = await getDeviceInfo();
      setDeviceInfo(info);
    } catch {
      setBound(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const activate = useCallback(async (licenseKey: string) => {
    setActivating(true);
    setError(null);

    try {
      const license = await validateLicense(licenseKey, AUTH_CONFIG);
      setLicenseId(license.id, AUTH_CONFIG);

      const boundDevice = await activateDevice(license.id, license.max_devices, AUTH_CONFIG);
      setDevice(boundDevice);
      setBound(true);

      return boundDevice;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Aktivasi gagal';
      setError(message);
      throw err;
    } finally {
      setActivating(false);
    }
  }, []);

  const activateTrial = useCallback(async () => {
    startTrial(undefined, AUTH_CONFIG);
    setBound(true);
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const devs = await getLicenseDevices(AUTH_CONFIG);
      setDevices(devs);
    } catch {
      // Ignore - might be offline
    }
  }, []);

  const unbindDevice = useCallback(async (deviceId: string) => {
    try {
      await removeDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal melepas perangkat';
      setError(message);
      throw err;
    }
  }, []);

  return {
    bound,
    device,
    devices,
    deviceInfo,
    loading,
    activating,
    error,
    check,
    activate,
    activateTrial,
    loadDevices,
    unbindDevice,
  };
}
