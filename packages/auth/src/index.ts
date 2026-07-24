// Supabase client
export { getSupabase, default } from './supabase';

// Auth functions
export type { AuthUser } from './auth';
export { login, logout, getSession, getCurrentUser, onAuthStateChange } from './auth';

// License management
export type { LicenseConfig, LicenseStatus } from './license';
export {
  validateLicense,
  startTrial,
  checkTrialExpiry,
  getLicenseStatus,
  TRIAL_DAYS,
  MAX_DEVICES,
} from './license';

// Device binding
export type { DeviceConfig, DeviceInfo } from './device';
export {
  getDeviceInfo,
  checkDeviceBinding,
  activateDevice,
  getLicenseDevices,
  removeDevice,
  setLicenseId,
  getLicenseId,
} from './device';

// Shared types
export type {
  AuthUserData,
  AuthSessionData,
  DeviceInfoData,
  ActivationFormData,
  LoginFormData,
} from './types';
