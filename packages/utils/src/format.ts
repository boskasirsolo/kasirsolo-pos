/**
 * Format a number as Indonesian Rupiah.
 * @example formatRupiah(150000) => "Rp 150.000"
 * @example formatRupiah(2500000, { compact: true }) => "Rp 2,5jt"
 */
export function formatRupiah(
  amount: number,
  options?: {
    /** Show "Rp" prefix (default: true) */
    prefix?: boolean;
    /** Use compact notation for large numbers */
    compact?: boolean;
    /** Number of decimal places for compact mode */
    decimals?: number;
  }
): string {
  const { prefix = true, compact = false, decimals = 1 } = options ?? {};
  const pfx = prefix ? "Rp " : "";

  if (compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `${pfx}${(amount / 1_000_000_000).toFixed(decimals).replace(".", ",")}M`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `${pfx}${(amount / 1_000_000).toFixed(decimals).replace(".", ",")}jt`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${pfx}${(amount / 1_000).toFixed(decimals).replace(".", ",")}rb`;
    }
  }

  const formatted = Math.abs(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const sign = amount < 0 ? "-" : "";
  return `${sign}${pfx}${formatted}`;
}

/**
 * Format a date string or Date object to Indonesian locale format.
 * @example formatDate("2026-07-22T10:30:00Z") => "22 Juli 2026"
 * @example formatDate("2026-07-22", { time: true }) => "22 Juli 2026, 10:30"
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: {
    /** Include time (default: false) */
    time?: boolean;
    /** Use relative format for recent dates */
    relative?: boolean;
    /** Short month names (default: false) */
    short?: boolean;
  }
): string {
  if (!date) return "-";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";

  const { time = false, relative = false, short = false } = options ?? {};

  if (relative) {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  }

  const months = short
    ? ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    : [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
      ];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let result = `${day} ${month} ${year}`;

  if (time) {
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    result += `, ${hours}:${mins}`;
  }

  return result;
}

/**
 * Format a phone number to Indonesian standard display.
 * @example formatPhone("628816566935") => "0881 6566 935"
 * @example formatPhone("0881-6566-935") => "0881 6566 935"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // Normalize: convert +62/62 prefix to 0
  if (digits.startsWith("62")) {
    digits = "0" + digits.slice(2);
  }
  if (!digits.startsWith("0")) {
    digits = "0" + digits;
  }

  // Format in groups: 4-4-rest
  if (digits.length >= 8) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`.trim();
  }

  return digits;
}

/**
 * Format a number with thousand separators (Indonesian style with dots).
 * @example formatNumber(1500) => "1.500"
 */
export function formatNumber(num: number): string {
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format a percentage value.
 * @example formatPercent(0.125) => "12,5%"
 * @example formatPercent(85, { fromDecimal: false }) => "85%"
 */
export function formatPercent(
  value: number,
  options?: { fromDecimal?: boolean; decimals?: number }
): string {
  const { fromDecimal = true, decimals = 1 } = options ?? {};
  const pct = fromDecimal ? value * 100 : value;
  return `${pct.toFixed(decimals).replace(".", ",")}%`;
}
