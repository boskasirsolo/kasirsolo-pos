/**
 * KASIRSOLO shared constants.
 */

/** KASIRSOLO WhatsApp support number (international format without +) */
export const WA_NUMBER = "628816566935";

/** WhatsApp display number (Indonesian format) */
export const WA_DISPLAY = "0881 6566 935";

/** License key format regex */
export const KEY_REGEX = /^KSP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/** App code format regex */
export const APP_CODE_REGEX = /^KSP-[A-Z0-9]{6}$/;

/** Brand name */
export const BRAND_NAME = "KASIRSOLO";

/** Company name */
export const COMPANY_NAME = "PT Mesin Kasir Solo";

/** Owner info */
export const OWNER_NAME = "Amin Maghfuri";
export const OWNER_EMAIL = "owner.kasirsolo@gmail.com";

/** Brand colors */
export const BRAND_COLORS = {
  primary: "#FF5F1F",
  secondary: "#F7A237",
  accent: "#FFCE55",
  dark: "#0D0D0D",
} as const;

/**
 * Application definitions for the KASIRSOLO product suite.
 */
export interface AppDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  target: string;
  price: number;
  trialDays: number;
  maxDevices: number;
  features: string[];
  status: "active" | "coming_soon";
}

export const APPS: AppDefinition[] = [
  {
    code: "kasir",
    name: "KASIRSOLO POS",
    description: "Aplikasi kasir & point of sale lengkap untuk semua jenis usaha",
    icon: "shopping-cart",
    category: "pos",
    target: "Retail, Toko, Warung",
    price: 299000,
    trialDays: 14,
    maxDevices: 3,
    features: [
      "Transaksi penjualan",
      "Manajemen produk & stok",
      "Struk thermal & digital",
      "Laporan harian & bulanan",
      "Multi-kasir",
      "Barcode scanner",
      "Diskon & pajak",
    ],
    status: "active",
  },
  {
    code: "inventory",
    name: "KASIRSOLO Inventory",
    description: "Sistem manajemen inventori & gudang multi-lokasi",
    icon: "package",
    category: "inventory",
    target: "Distributor, Grosir, Gudang",
    price: 399000,
    trialDays: 14,
    maxDevices: 5,
    features: [
      "Multi-gudang",
      "Transfer stok",
      "Stok opname",
      "Riwayat pergerakan stok",
      "Alert stok minimum",
      "Barcode management",
      "Laporan inventori",
    ],
    status: "active",
  },
  {
    code: "laundry",
    name: "KASIRSOLO Laundry",
    description: "Sistem kasir khusus laundry dengan tracking order",
    icon: "shirt",
    category: "service",
    target: "Laundry, Dry Cleaning",
    price: 249000,
    trialDays: 14,
    maxDevices: 2,
    features: [
      "Order tracking",
      "Nota & struk otomatis",
      "Paket layanan",
      "Notifikasi WhatsApp",
      "Laporan pendapatan",
      "Member & pelanggan",
    ],
    status: "active",
  },
  {
    code: "resto",
    name: "KASIRSOLO Resto",
    description: "Sistem kasir restoran dengan manajemen meja & dapur",
    icon: "utensils",
    category: "fnb",
    target: "Restoran, Cafe, Rumah Makan",
    price: 349000,
    trialDays: 14,
    maxDevices: 5,
    features: [
      "Manajemen meja",
      "Order dapur (KOT)",
      "Split bill",
      "Menu & kategori",
      "Reservasi",
      "Laporan penjualan",
      "Multi-kasir",
    ],
    status: "active",
  },
  {
    code: "toko",
    name: "KASIRSOLO Toko",
    description: "Aplikasi kasir simpel untuk toko kecil & UMKM",
    icon: "store",
    category: "retail",
    target: "Toko Kelontong, UMKM, Warung",
    price: 149000,
    trialDays: 14,
    maxDevices: 1,
    features: [
      "Transaksi cepat",
      "Katalog produk",
      "Struk WhatsApp",
      "Laporan harian",
      "Stok sederhana",
    ],
    status: "active",
  },
  {
    code: "barbershop",
    name: "KASIRSOLO Barbershop",
    description: "Sistem kasir & booking untuk barbershop & salon",
    icon: "scissors",
    category: "service",
    target: "Barbershop, Salon, Spa",
    price: 199000,
    trialDays: 14,
    maxDevices: 2,
    features: [
      "Booking & jadwal",
      "Layanan & paket",
      "Komisi karyawan",
      "Member & loyalty",
      "Laporan pendapatan",
      "Notifikasi booking",
    ],
    status: "active",
  },
  {
    code: "bengkel",
    name: "KASIRSOLO Bengkel",
    description: "Sistem kasir bengkel dengan tracking service order",
    icon: "wrench",
    category: "service",
    target: "Bengkel Motor, Bengkel Mobil",
    price: 299000,
    trialDays: 14,
    maxDevices: 3,
    features: [
      "Service order tracking",
      "Sparepart & stok",
      "Riwayat servis kendaraan",
      "Invoice & struk",
      "Teknisi & antrian",
      "Laporan servis",
    ],
    status: "active",
  },
  {
    code: "apotek",
    name: "KASIRSOLO Apotek",
    description: "Sistem kasir apotek dengan manajemen obat & resep",
    icon: "pill",
    category: "retail",
    target: "Apotek, Toko Obat",
    price: 349000,
    trialDays: 14,
    maxDevices: 3,
    features: [
      "Manajemen obat",
      "Tracking kadaluarsa",
      "Resep dokter",
      "Stok & batch",
      "Laporan penjualan obat",
      "Alert stok minimum",
      "BPOM integration-ready",
    ],
    status: "coming_soon",
  },
];

/**
 * Get an app definition by its code.
 */
export function getAppDefinition(code: string): AppDefinition | undefined {
  return APPS.find((app) => app.code === code);
}
