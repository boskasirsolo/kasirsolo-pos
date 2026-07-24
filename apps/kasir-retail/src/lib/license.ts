// Re-exported from shared @kasirsolo/auth package (uses default config)
import {
  validateLicense,
  startTrial,
  checkTrialExpiry,
  getLicenseStatus,
  TRIAL_DAYS,
  MAX_DEVICES,
  PRICE,
} from '@kasirsolo/auth';
import type { LicenseStatus } from '@kasirsolo/auth';

export type { LicenseStatus };
export {
  validateLicense,
  startTrial,
  checkTrialExpiry,
  getLicenseStatus,
  TRIAL_DAYS,
  MAX_DEVICES,
  PRICE,
};
