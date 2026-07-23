const steps = [
  {
    number: 1,
    icon: '\uD83D\uDCDD',
    title: 'Daftar Trial',
    desc: 'Isi form sederhana, langsung aktif tanpa verifikasi ribet.',
  },
  {
    number: 2,
    icon: '\uD83D\uDE80',
    title: 'Pakai 7 Hari',
    desc: 'Coba semua fitur tanpa batasan selama masa trial gratis.',
  },
  {
    number: 3,
    icon: '\uD83D\uDCB3',
    title: 'Bayar Sekali',
    desc: 'Puas? Bayar sekali saja. Tidak ada biaya langganan bulanan.',
  },
  {
    number: 4,
    icon: '\u2705',
    title: 'Aktivasi Seumur Hidup',
    desc: 'Akun Anda aktif selamanya. Update gratis, support via WA.',
  },
];

export function HowItWorks() {
  return (
    <section className="how-it-works" id="cara-kerja">
      <div className="container text-center">
        <span className="section-badge">{'\u2699\uFE0F'} Cara Kerja</span>
        <h2 className="section-title">
          Mulai dalam <span className="gradient-text">4 Langkah</span> Mudah
        </h2>
        <p className="section-subtitle">
          Dari pendaftaran sampai aktivasi, prosesnya cepat dan tanpa ribet.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.number} className="step-card">
            <div className="step-number">{step.number}</div>
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
