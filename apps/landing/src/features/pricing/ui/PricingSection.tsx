const pricingFeatures = [
  'Akses semua fitur',
  'Update gratis selamanya',
  'Support WA langsung',
  'Backup cloud otomatis',
  'Multi-device sync',
  'Tanpa biaya langganan',
  'Training & onboarding',
  'Kustomisasi gratis',
];

const WA_NUMBER = '628816566935';

export function PricingSection() {
  const waMessage = encodeURIComponent(
    'Halo KASIRSOLO, saya tertarik dengan aplikasi Anda. Bisa info lebih lanjut tentang harga?'
  );

  return (
    <section className="pricing-section" id="harga">
      <div className="container text-center">
        <span className="section-badge">{'\uD83D\uDCB0'} Harga</span>
        <h2 className="section-title">
          Investasi <span className="gradient-text">Sekali</span>, Untung{' '}
          <span className="gradient-text">Selamanya</span>
        </h2>
        <p className="section-subtitle">
          Tanpa biaya langganan bulanan. Bayar sekali, aplikasi aktif seumur hidup
          dengan update dan support gratis.
        </p>
      </div>

      <div className="pricing-inner">
        <div className="pricing-card">
          <div className="pricing-badge">{'\uD83C\uDFC6'} Best Value</div>

          <div className="pricing-value">
            <span className="pricing-from">Mulai dari</span>
            <div className="pricing-amount">
              <span className="pricing-currency">Rp</span>200.000
            </div>
            <span className="pricing-period">/sekali bayar seumur hidup</span>
          </div>

          <p className="pricing-subtitle">
            Harga tergantung jenis aplikasi. Semua sudah termasuk fitur lengkap,
            update, dan support.
          </p>

          <div className="pricing-features">
            {pricingFeatures.map((feature, i) => (
              <div key={i} className="pricing-feature">
                <span className="pricing-feature-check">{'\u2713'}</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pricing-actions">
            <a href="#trial" className="btn btn-primary btn-lg">
              Coba Gratis 7 Hari
            </a>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              Tanya Harga
            </a>
          </div>

          <p className="pricing-note">
            * Trial 7 hari gratis tanpa kartu kredit. Bisa perpanjang trial.
          </p>
        </div>
      </div>
    </section>
  );
}
