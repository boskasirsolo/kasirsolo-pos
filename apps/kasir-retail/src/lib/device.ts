// Re-exported from shared @kasirsolo/auth package (uses default config)
import {
  getDeviceInfo,
  checkDeviceBinding,
  activateDevice,
  getLicenseDevices,
  removeDevice,
  setLicenseId,
  getLicenseId,
} from '@kasirsolo/auth';
import type { DeviceInfo } from '@kasirsolo/auth';

export type { DeviceInfo };
export {
  getDeviceInfo,
  checkDeviceBinding,
  activateDevice,
  getLicenseDevices,
  removeDevice,
  setLicenseId,
  getLicenseId,
};
