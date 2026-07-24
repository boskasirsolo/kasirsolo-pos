/**
 * Smoke test to verify Vitest is working correctly.
 */
import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should format rupiah correctly with Intl.NumberFormat', () => {
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(50000);

    expect(formatted).toContain('50.000');
  });

  it('should parse key regex for license validation', () => {
    const KEY_REGEX = /^KSP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    expect(KEY_REGEX.test('KSP-ABCD-1234-WXYZ')).toBe(true);
    expect(KEY_REGEX.test('invalid-key')).toBe(false);
  });
});
