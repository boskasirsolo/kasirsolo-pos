import { KEY_REGEX } from "./constants";

/**
 * Character set used for license key generation.
 * Excludes confusing characters (0/O, 1/I/L) for readability.
 */
const KEY_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a random segment of a given length.
 */
function randomSegment(length: number): string {
  let segment = "";
  const array = new Uint8Array(length);

  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto (e.g. tests)
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    segment += KEY_CHARS[array[i] % KEY_CHARS.length];
  }
  return segment;
}

/**
 * Generate a KASIRSOLO license key.
 *
 * Format: KSP-XXXX-XXXX-XXXX
 * - Prefix: "KSP"
 * - 3 groups of 4 alphanumeric characters
 * - Total: 16 characters (12 random + 3 separators + prefix)
 *
 * @example genKey() => "KSP-A7HB-3KMN-9PQR"
 */
export function genKey(): string {
  const s1 = randomSegment(4);
  const s2 = randomSegment(4);
  const s3 = randomSegment(4);
  return `KSP-${s1}-${s2}-${s3}`;
}

/**
 * Validate whether a string matches the KASIRSOLO license key format.
 *
 * @example isValidKey("KSP-A7HB-3KMN-9PQR") => true
 * @example isValidKey("INVALID") => false
 */
export function isValidKey(key: string): boolean {
  return KEY_REGEX.test(key);
}

/**
 * Normalize a license key string:
 * - Uppercase
 * - Remove extra whitespace
 * - Ensure dash separators
 *
 * @example normalizeKey("ksp a7hb 3kmn 9pqr") => "KSP-A7HB-3KMN-9PQR"
 */
export function normalizeKey(input: string): string {
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleaned.length !== 15 || !cleaned.startsWith("KSP")) {
    return input.toUpperCase().trim();
  }

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}-${cleaned.slice(11, 15)}`;
}
