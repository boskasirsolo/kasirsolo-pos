// @kasirsolo/auth – shared authentication, license, and device modules.
// Import from here:
//   import { login, logout, getSession, getCurrentUser, onAuthStateChange } from "@kasirsolo/auth";
//   import { validateLicense, checkTrialExpiry, startTrial, getLicenseStatus } from "@kasirsolo/auth/license";
//   import { activateDevice, checkDeviceBinding, getLicenseDevices, removeDevice } from "@kasirsolo/auth/device";

export type { AuthUser } from './auth';
export * from './auth';

export * from './license';
export type { LicenseStatus } from './license';

export * from './device';
export type { DeviceInfo } from './device';
export type { AuthConfig } from './license';
