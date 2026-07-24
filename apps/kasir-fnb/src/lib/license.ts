// Re-exported from shared @kasirsolo/auth package with F&B config
import {
  validateLicense,
  startTrial,
  checkTrialExpiry,
  getLicenseStatus,
  TRIAL_DAYS,
  MAX_DEVICES,
} from '@kasirsolo/auth';
import type { LicenseConfig, LicenseStatus } from '@kasirsolo/auth';

const FNB_CONFIG: Required<LicenseConfig> = {
  storageKeyPrefix: 'kasirsolo_fnb_',
  price: 350000,
};

export const PRICE = FNB_CONFIG.price;
export type { LicenseStatus };
export { validateLicense, startTrial, checkTrialExpiry, getLicenseStatus, TRIAL_DAYS, MAX_DEVICES };
