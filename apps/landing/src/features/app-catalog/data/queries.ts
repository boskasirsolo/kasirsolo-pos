import type { AppItem } from './types';

/**
 * Static fallback data for apps.
 * In production, these can be fetched from Supabase ksp_apps table.
 */
export const appsData: AppItem[] = [
  {
    id: 'retail',
    slug: 'retail',
    name: 'Kasir Retail',
    icon: '\uD83D\uDED2',
    price: 250000,
    priceFormatted: 'Rp250.000',
    category: 'bisnis',
    categoryLabel: 'Bisnis',
    hot: true,
    description:
      'Sistem kasir lengkap untuk toko retail, minimarket, dan warung. Dilengkapi manajemen stok, barcode scanner, laporan penjualan, dan multi-kasir.',
    features: [
      'Point of Sale (POS) modern',
      'Manajemen stok & barcode',
      'Laporan penjualan harian/bulanan',
      'Multi-kasir & shift',
      'Manajemen member & diskon',
      'Cetak struk thermal',
    ],
  },
  {
    id: 'konveksi',
    slug: 'konveksi',
    name: 'Manajemen Konveksi',
    icon: '\uD83D\uDC55',
    price: 350000,
    priceFormatted: 'Rp350.000',
    category: 'bisnis',
    categoryLabel: 'Bisnis',
    description:
      'Kelola produksi konveksi dari order hingga pengiriman. Tracking progress, manajemen bahan baku, dan kalkulasi HPP otomatis.',
    features: [
      'Tracking order & produksi',
      'Manajemen bahan baku',
      'Kalkulasi HPP otomatis',
      'Deadline & reminder',
      'Laporan produksi',
      'Invoice & pembayaran',
    ],
  },
  {
    id: 'bengkel',
    slug: 'bengkel',
    name: 'Bengkel + Sparepart',
    icon: '\uD83D\uDD27',
    price: 400000,
    priceFormatted: 'Rp400.000',
    category: 'bisnis',
    categoryLabel: 'Bisnis',
    hot: true,
    description:
      'Manajemen bengkel lengkap dengan antrian service, stok sparepart, dan invoice otomatis. Cocok untuk bengkel motor, mobil, dan AC.',
    features: [
      'Antrian service & work order',
      'Stok sparepart real-time',
      'Riwayat service pelanggan',
      'Invoice & estimasi biaya',
      'Laporan pendapatan service',
      'Notifikasi service berkala',
    ],
  },
  {
    id: 'masjid',
    slug: 'masjid',
    name: 'Manajemen Masjid',
    icon: '\uD83D\uDD4C',
    price: 200000,
    priceFormatted: 'Rp200.000',
    category: 'institusi',
    categoryLabel: 'Institusi',
    description:
      'Kelola keuangan masjid transparan: infaq, zakat, kas, dan laporan untuk jamaah. Lengkap dengan agenda kegiatan dan profil masjid.',
    features: [
      'Pencatatan infaq & zakat',
      'Kas masuk & keluar',
      'Laporan keuangan transparan',
      'Agenda kegiatan masjid',
      'Profil & informasi masjid',
      'Cetak laporan bulanan',
    ],
  },
  {
    id: 'tpa',
    slug: 'tpa',
    name: 'Manajemen TPA/TPQ',
    icon: '\uD83D\uDCD6',
    price: 200000,
    priceFormatted: 'Rp200.000',
    category: 'institusi',
    categoryLabel: 'Institusi',
    description:
      'Sistem manajemen TPA/TPQ untuk pencatatan santri, absensi, progres hafalan, dan administrasi keuangan.',
    features: [
      'Data santri & wali',
      'Absensi digital',
      'Progres hafalan Al-Quran',
      'Jadwal & kalender',
      'Administrasi keuangan',
      'Rapor & sertifikat',
    ],
  },
  {
    id: 'klinik',
    slug: 'klinik',
    name: 'Klinik THT',
    icon: '\uD83E\uDE7A',
    price: 500000,
    priceFormatted: 'Rp500.000',
    category: 'kesehatan',
    categoryLabel: 'Kesehatan',
    description:
      'Sistem informasi klinik THT: rekam medis, antrian pasien, kasir, dan laporan. Sesuai standar faskes.',
    features: [
      'Rekam medis elektronik',
      'Antrian pasien digital',
      'Resep & tindakan medis',
      'Kasir & pembayaran',
      'Laporan kunjungan',
      'Riwayat pasien lengkap',
    ],
  },
  {
    id: 'apotek',
    slug: 'apotek',
    name: 'Apotek',
    icon: '\uD83D\uDC8A',
    price: 450000,
    priceFormatted: 'Rp450.000',
    category: 'kesehatan',
    categoryLabel: 'Kesehatan',
    hot: true,
    description:
      'Manajemen apotek lengkap: stok obat, penjualan, resep, expired date tracking, dan laporan sesuai regulasi.',
    features: [
      'Stok obat & expired tracking',
      'POS apotek',
      'Manajemen resep',
      'Supplier & purchase order',
      'Laporan penjualan obat',
      'Alert stok minimum',
    ],
  },
  {
    id: 'dapur',
    slug: 'dapur',
    name: 'Dapur SPPG',
    icon: '\uD83C\uDF73',
    price: 300000,
    priceFormatted: 'Rp300.000',
    category: 'institusi',
    categoryLabel: 'Institusi',
    description:
      'Sistem manajemen dapur untuk institusi: perencanaan menu, stok bahan, kalkulasi gizi, dan laporan harian.',
    features: [
      'Perencanaan menu harian',
      'Stok bahan baku',
      'Kalkulasi gizi & nutrisi',
      'Laporan pengeluaran dapur',
      'Permintaan & distribusi',
      'Rekap bulanan',
    ],
  },
];

/**
 * Fetch apps from Supabase ksp_apps table.
 * Falls back to static data if Supabase is not configured.
 */
export async function fetchApps(): Promise<AppItem[]> {
  // For now, return static data.
  // When Supabase is configured, uncomment below:
  /*
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from('ksp_apps')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (data && data.length > 0) return data as AppItem[];
  }
  */
  return appsData;
}
