const features = [
  {
    icon: '\uD83D\uDCB3',
    title: 'Bayar Sekali Seumur Hidup',
    desc: 'Tidak ada biaya langganan bulanan. Bayar sekali, aplikasi aktif selamanya dengan update gratis.',
  },
  {
    icon: '\uD83D\uDCCA',
    title: 'Laporan Real-time',
    desc: 'Dashboard lengkap dengan laporan penjualan, stok, keuangan yang update otomatis secara real-time.',
  },
  {
    icon: '\uD83D\uDD12',
    title: 'Data Aman & Terenkripsi',
    desc: 'Data bisnis Anda dilindungi enkripsi end-to-end. Backup otomatis ke cloud setiap hari.',
  },
  {
    icon: '\uD83D\uDCF1',
    title: 'Multi-Device & Platform',
    desc: 'Akses dari HP, tablet, atau laptop. Sinkronisasi data otomatis antar perangkat.',
  },
  {
    icon: '\uD83D\uDCAC',
    title: 'Support WA Langsung',
    desc: 'Bantuan teknis langsung via WhatsApp. Respons cepat dari tim support berpengalaman.',
  },
  {
    icon: '\u2699\uFE0F',
    title: 'Kustomisasi Fleksibel',
    desc: 'Sesuaikan tampilan, fitur, dan workflow sesuai kebutuhan bisnis Anda. Tanpa biaya tambahan.',
  },
];

export function FeaturesSection() {
  return (
    <section className="features-section" id="fitur">
      <div className="container text-center">
        <span className="section-badge">{'\u2728'} Keunggulan</span>
        <h2 className="section-title">
          Kenapa Pilih <span className="gradient-text">KASIRSOLO</span>?
        </h2>
        <p className="section-subtitle">
          Bukan sekadar aplikasi kasir biasa. KASIRSOLO dirancang untuk membantu
          bisnis Anda tumbuh lebih cepat.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
