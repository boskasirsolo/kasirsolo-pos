const benefits = [
  {
    icon: '\uD83C\uDD93',
    title: '7 Hari Trial Gratis',
    desc: 'Coba semua fitur tanpa batasan selama 7 hari penuh.',
  },
  {
    icon: '\u23F0',
    title: 'Bisa Perpanjang Trial',
    desc: 'Butuh waktu lebih? Hubungi kami untuk perpanjangan trial.',
  },
  {
    icon: '\uD83D\uDCAC',
    title: 'Support WA Langsung',
    desc: 'Tim support siap membantu via WhatsApp kapan saja.',
  },
];

export function TrialBenefits() {
  return (
    <div className="trial-benefits">
      {benefits.map((b, i) => (
        <div key={i} className="trial-benefit">
          <div className="trial-benefit-icon">{b.icon}</div>
          <div className="trial-benefit-text">
            <h4>{b.title}</h4>
            <p>{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
