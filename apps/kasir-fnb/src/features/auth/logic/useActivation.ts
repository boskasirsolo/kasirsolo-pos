"use client";

import { useState, useEffect, useCallback } from "react";
import {
  checkDeviceBinding,
  activateDevice,
  getLicenseDevices,
  removeDevice,
  setLicenseId,
  getDeviceInfo,
  type DeviceInfo,
} from "@/lib/device";
import { validateLicense, startTrial } from "@/lib/license";
import type { KspDevice } from "@kasirsolo/db";

export function useActivation() {
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
      const result = await checkDeviceBinding();
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

  const activate = useCallback(
    async (licenseKey: string) => {
      setActivating(true);
      setError(null);

      try {
        const license = await validateLicense(licenseKey);
        setLicenseId(license.id);

        const boundDevice = await activateDevice(license.id, license.max_devices);
        setDevice(boundDevice);
        setBound(true);

        return boundDevice;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Aktivasi gagal";
        setError(message);
        throw err;
      } finally {
        setActivating(false);
      }
    },
    []
  );

  const activateTrial = useCallback(async () => {
    startTrial();
    setBound(true);
  }, []);

  const loadDevices = useCallback(async () => {
    try {
      const devs = await getLicenseDevices();
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
      const message = err instanceof Error ? err.message : "Gagal melepas perangkat";
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
