// Format utilities
export { formatRupiah, formatDate, formatPhone, formatNumber, formatPercent } from './format';

// WhatsApp link builders
export { waLink, waSupportLink, waOrderLink } from './wa';

// License key utilities
export { genKey, isValidKey, normalizeKey } from './license-key';

// Device fingerprint
export { generateFingerprint, getDeviceId } from './device-fingerprint';

// Validators
export {
  required,
  email,
  phone,
  minLength,
  maxLength,
  numberRange,
  licenseKey,
  validate,
  validateForm,
} from './validators';
export type { ValidationResult } from './validators';

// Constants
export {
  WA_NUMBER,
  WA_DISPLAY,
  KEY_REGEX,
  BRAND_NAME,
  COMPANY_NAME,
  OWNER_NAME,
  OWNER_EMAIL,
  BRAND_COLORS,
  APPS,
  getAppDefinition,
} from './constants';
export type { AppDefinition } from './constants';
