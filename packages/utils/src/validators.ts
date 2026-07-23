/**
 * Shared validation functions for KASIRSOLO.
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validate that a value is not empty.
 */
export function required(value: unknown, fieldName?: string): ValidationResult {
  const label = fieldName ?? "Field";

  if (value === null || value === undefined) {
    return { valid: false, message: `${label} wajib diisi` };
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return { valid: false, message: `${label} wajib diisi` };
  }

  return { valid: true };
}

/**
 * Validate an email address.
 */
export function email(value: string, fieldName?: string): ValidationResult {
  const label = fieldName ?? "Email";

  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${label} wajib diisi` };
  }

  // RFC 5322 simplified regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(value)) {
    return { valid: false, message: `Format ${label.toLowerCase()} tidak valid` };
  }

  return { valid: true };
}

/**
 * Validate an Indonesian phone number.
 * Accepts formats: 08xx, +628xx, 628xx
 */
export function phone(value: string, fieldName?: string): ValidationResult {
  const label = fieldName ?? "Nomor telepon";

  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${label} wajib diisi` };
  }

  // Remove common separators
  const cleaned = value.replace(/[\s\-().]/g, "");

  // Indonesian phone patterns
  const phoneRegex = /^(\+?62|0)8[1-9]\d{7,11}$/;

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: `Format ${label.toLowerCase()} tidak valid (contoh: 0812xxxxxxxx)` };
  }

  return { valid: true };
}

/**
 * Validate minimum length.
 */
export function minLength(value: string, min: number, fieldName?: string): ValidationResult {
  const label = fieldName ?? "Field";

  if (!value || value.length < min) {
    return { valid: false, message: `${label} minimal ${min} karakter` };
  }

  return { valid: true };
}

/**
 * Validate maximum length.
 */
export function maxLength(value: string, max: number, fieldName?: string): ValidationResult {
  const label = fieldName ?? "Field";

  if (value && value.length > max) {
    return { valid: false, message: `${label} maksimal ${max} karakter` };
  }

  return { valid: true };
}

/**
 * Validate a number is within a range.
 */
export function numberRange(
  value: number,
  min: number,
  max: number,
  fieldName?: string
): ValidationResult {
  const label = fieldName ?? "Nilai";

  if (isNaN(value)) {
    return { valid: false, message: `${label} harus berupa angka` };
  }

  if (value < min || value > max) {
    return { valid: false, message: `${label} harus antara ${min} dan ${max}` };
  }

  return { valid: true };
}

/**
 * Validate a license key format.
 */
export function licenseKey(value: string, fieldName?: string): ValidationResult {
  const label = fieldName ?? "License key";
  const keyRegex = /^KSP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${label} wajib diisi` };
  }

  if (!keyRegex.test(value.toUpperCase())) {
    return { valid: false, message: `Format ${label.toLowerCase()} tidak valid (KSP-XXXX-XXXX-XXXX)` };
  }

  return { valid: true };
}

/**
 * Run multiple validators and return the first error.
 */
export function validate(
  ...results: ValidationResult[]
): ValidationResult {
  for (const result of results) {
    if (!result.valid) return result;
  }
  return { valid: true };
}

/**
 * Run validators on a form object and return all errors.
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, (value: unknown) => ValidationResult>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const [field, validator] of Object.entries(rules) as Array<[keyof T, (value: unknown) => ValidationResult]>) {
    if (validator) {
      const result = validator(data[field]);
      if (!result.valid) {
        valid = false;
        errors[field] = result.message;
      }
    }
  }

  return { valid, errors };
}
