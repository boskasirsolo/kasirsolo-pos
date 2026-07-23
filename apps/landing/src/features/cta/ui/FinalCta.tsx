const WA_NUMBER = '628816566935';

export function FinalCta() {
  const waMessage = encodeURIComponent(
    'Halo KASIRSOLO, saya tertarik dengan aplikasi Anda. Bisa info lebih lanjut?'
  );

  return (
    <section className="final-cta">
      <div className="final-cta-inner">
        <h2>
          Siap Tingkatkan <span className="gradient-text">Bisnis</span> Anda?
        </h2>
        <p>
          Bergabung dengan ratusan pelaku usaha yang sudah mempercayakan
          manajemen bisnis mereka kepada KASIRSOLO. Mulai trial gratis sekarang.
        </p>
        <div className="final-cta-actions">
          <a href="#trial" className="btn btn-primary btn-lg">
            Coba Gratis 7 Hari
          </a>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa btn-lg"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
