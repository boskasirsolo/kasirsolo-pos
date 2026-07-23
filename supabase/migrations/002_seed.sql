-- ============================================================================
-- KASIRSOLO - Seed Data
-- Developer: PT Mesin Kasir Solo
-- Created: 2026-07-22
-- Updated: 2026-07-23
-- ============================================================================

-- ============================================================================
-- SEED: ksp_apps (9 Products)
-- ============================================================================

INSERT INTO ksp_apps (slug, name, description, icon, category, price, features, sort_order) VALUES

-- BISNIS APPS
('retail', 'Kasir Retail',
 'Aplikasi kasir untuk toko retail. Mendukung barcode scanner, struk printer, manajemen stok, laporan penjualan harian/bulanan, multi-kasir, dan mode offline.',
 '🛒', 'bisnis', 250000,
 '[
   "Point of Sale (POS)",
   "Barcode Scanner",
   "Manajemen Stok",
   "Struk Printer (Bluetooth/USB)",
   "Laporan Penjualan",
   "Multi Kasir",
   "Mode Offline",
   "Manajemen Pelanggan",
   "Diskon & Promo",
   "Export Laporan (PDF/Excel)"
 ]'::jsonb, 1),

('fnb', 'Kasir F&B',
 'Aplikasi kasir untuk restoran, kafe, dan warung makan. Manajemen meja, Kitchen Display System (KDS), split bill, order dine-in/takeaway/delivery, antrian, dan mode offline.',
 '🍽️', 'bisnis', 350000,
 '[
   "Point of Sale (POS)",
   "Manajemen Meja",
   "Kitchen Display System (KDS)",
   "Split Bill",
   "Order Dine-in/Takeaway/Delivery",
   "Sistem Antrian",
   "Modifier Menu (Topping/Size/Level)",
   "Service Charge & Pajak",
   "Laporan & Analitik",
   "Mode Offline"
 ]'::jsonb, 2),

('konveksi', 'Manajemen Konveksi',
 'Aplikasi manajemen produksi konveksi. Tracking order dari desain hingga pengiriman, manajemen bahan baku, kalkulasi HPP, dan invoice.',
 '👕', 'bisnis', 350000,
 '[
   "Order Tracking",
   "Manajemen Bahan Baku",
   "Kalkulasi HPP",
   "Deadline & Progress",
   "Invoice & Pembayaran",
   "Laporan Produksi",
   "Katalog Produk",
   "Manajemen Pelanggan",
   "Mode Offline",
   "Export Laporan"
 ]'::jsonb, 3),

('bengkel', 'Bengkel + Sparepart',
 'Aplikasi manajemen bengkel dan toko sparepart. Service tracking, stok sparepart, antrian servis, history kendaraan, dan nota servis.',
 '🔧', 'bisnis', 400000,
 '[
   "Service Tracking",
   "Stok Sparepart",
   "Antrian Servis",
   "History Kendaraan",
   "Nota Servis",
   "Point of Sale (Sparepart)",
   "Estimasi Biaya",
   "Reminder Service",
   "Manajemen Mekanik",
   "Laporan Pendapatan"
 ]'::jsonb, 4),

-- INSTITUSI APPS
('masjid', 'Manajemen Masjid',
 'Aplikasi manajemen keuangan dan kegiatan masjid. Pencatatan infaq, kas masjid, jadwal kegiatan, manajemen jamaah, dan laporan keuangan transparan.',
 '🕌', 'institusi', 200000,
 '[
   "Pencatatan Infaq & Sedekah",
   "Kas Masjid",
   "Jadwal Kegiatan",
   "Manajemen Jamaah",
   "Laporan Keuangan",
   "Pengumuman Digital",
   "Jadwal Sholat",
   "Inventaris Masjid",
   "Mode Offline",
   "Export Laporan"
 ]'::jsonb, 5),

('tpa', 'Manajemen TPA/TPQ',
 'Aplikasi manajemen Taman Pendidikan Al-Quran. Absensi santri, progress hafalan, jadwal mengaji, pembayaran SPP, dan rapor digital.',
 '📖', 'institusi', 200000,
 '[
   "Absensi Santri",
   "Progress Hafalan",
   "Jadwal Mengaji",
   "Pembayaran SPP",
   "Rapor Digital",
   "Manajemen Pengajar",
   "Notifikasi Orang Tua",
   "Kalender Akademik",
   "Mode Offline",
   "Export Laporan"
 ]'::jsonb, 6),

('dapur', 'Dapur SPPG',
 'Aplikasi manajemen dapur untuk Satuan Penyelenggara Pangan Gabungan (SPPG). Perencanaan menu, manajemen bahan, kalkulasi gizi, dan laporan harian.',
 '🍳', 'institusi', 300000,
 '[
   "Perencanaan Menu",
   "Manajemen Bahan",
   "Kalkulasi Gizi",
   "Laporan Harian",
   "Stok Bahan Baku",
   "Resep & Porsi",
   "Anggaran Harian",
   "Jadwal Masak",
   "Mode Offline",
   "Export Laporan"
 ]'::jsonb, 7),

-- KESEHATAN APPS
('klinik', 'Klinik THT',
 'Aplikasi manajemen klinik THT (Telinga Hidung Tenggorokan). Rekam medis elektronik, antrian pasien, jadwal dokter, resep, dan billing.',
 '🩺', 'kesehatan', 500000,
 '[
   "Rekam Medis Elektronik",
   "Antrian Pasien",
   "Jadwal Dokter",
   "E-Resep",
   "Billing & Invoice",
   "ICD-10 Database",
   "Riwayat Pemeriksaan",
   "Surat Rujukan",
   "Mode Offline",
   "Laporan Kunjungan"
 ]'::jsonb, 8),

('apotek', 'Apotek',
 'Aplikasi manajemen apotek. Point of sale obat, stok obat dengan expired date tracking, resep dokter, dan pelaporan SIPNAP.',
 '💊', 'kesehatan', 450000,
 '[
   "Point of Sale Obat",
   "Stok & Expired Tracking",
   "Resep Dokter",
   "Pelaporan SIPNAP",
   "Manajemen Supplier",
   "Retur Obat",
   "Harga Berjenjang",
   "Barcode Scanner",
   "Mode Offline",
   "Laporan Penjualan"
 ]'::jsonb, 9);

-- ============================================================================
-- SEED: ksp_settings (Default Global Settings)
-- ============================================================================

INSERT INTO ksp_settings (key, value, description, is_public) VALUES

('app.name', '"KASIRSOLO"', 'Application name', true),

('app.version', '"1.0.0"', 'Current application version', true),

('app.description', '"Multi-App POS & Management Platform by PT Mesin Kasir Solo"', 'Application description', true),

('brand.primary_color', '"#FF5F1F"', 'Primary brand color', true),
('brand.secondary_color', '"#F7A237"', 'Secondary brand color', true),
('brand.accent_color', '"#FFCE55"', 'Accent brand color', true),

('company.name', '"PT Mesin Kasir Solo"', 'Company legal name', true),
('company.email', '"owner.kasirsolo@gmail.com"', 'Company email', true),
('company.whatsapp', '"628816566935"', 'Company WhatsApp number', true),
('company.phone', '"0881 6566 935"', 'Company phone display', true),

('company.legal_address', '{"street": "Perum Graha Tiara 2 B1 Gumpang 07/01", "district": "Kartasura", "regency": "Sukoharjo", "province": "Jawa Tengah", "postal_code": "57169", "maps_url": "https://maps.app.goo.gl/DtNwuJvY9KufJN3CA"}', 'Company legal address', true),

('company.operational_address', '{"street": "Gumiring 04/04, Sidomulyo", "district": "Banjarejo", "regency": "Blora", "province": "Jawa Tengah", "postal_code": "58253", "maps_url": "https://maps.app.goo.gl/F9YMpuBUPMd1tcNWA"}', 'Company operational address', true),

('trial.duration_days', '14', 'Trial period duration in days', false),
('trial.max_transactions', '100', 'Max transactions during trial', false),

('license.default_max_devices', '2', 'Default maximum devices per license', false),
('license.grace_period_days', '7', 'Grace period after expiry before suspension', false),

('pricing.offline', '{"description": "One-time payment, offline only", "includes_updates": true, "update_period_months": 12}', 'Offline plan pricing details', true),

('pricing.cloud_monthly', '{"description": "Monthly subscription, cloud sync", "discount_percent": 0}', 'Cloud monthly plan details', true),

('pricing.cloud_yearly', '{"description": "Yearly subscription, cloud sync", "discount_percent": 20}', 'Cloud yearly plan details (20% discount)', true),

('site.default_template', '"minimal"', 'Default portfolio site template', false),
('site.max_pages', '10', 'Maximum pages per portfolio site', false),

('notification.channels', '["whatsapp", "email"]', 'Active notification channels', false),

('maintenance.mode', 'false', 'Maintenance mode toggle', false),
('maintenance.message', '"Sistem sedang dalam pemeliharaan. Silakan coba beberapa saat lagi."', 'Maintenance mode message', true);

-- ============================================================================
-- COMPLETED: Seed data
-- - 9 apps in ksp_apps (incl. fnb)
-- - 22 settings in ksp_settings
-- ============================================================================
