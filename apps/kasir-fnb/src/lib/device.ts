// Re-exported from shared @kasirsolo/auth package with F&B-specific device config
import {
  getDeviceInfo,
  checkDeviceBinding as _checkDeviceBinding,
  activateDevice as _activateDevice,
  getLicenseDevices as _getLicenseDevices,
  removeDevice,
  setLicenseId as _setLicenseId,
  getLicenseId as _getLicenseId,
} from '@kasirsolo/auth';
import type { DeviceInfo } from '@kasirsolo/auth';

const FNB_DEVICE_CONFIG = { storageKeyPrefix: 'kasirsolo_fnb_' };

export type { DeviceInfo };

// Wrapper functions that inject the FNB device config
export async function checkDeviceBinding() {
  return _checkDeviceBinding(FNB_DEVICE_CONFIG);
}

export { getDeviceInfo, removeDevice };

export async function activateDevice(licenseId: string, maxDevices: number) {
  return _activateDevice(licenseId, maxDevices, FNB_DEVICE_CONFIG);
}

export async function getLicenseDevices() {
  return _getLicenseDevices(FNB_DEVICE_CONFIG);
}

export function setLicenseId(licenseId: string) {
  _setLicenseId(licenseId, FNB_DEVICE_CONFIG);
}

export function getLicenseId() {
  return _getLicenseId(FNB_DEVICE_CONFIG);
}
