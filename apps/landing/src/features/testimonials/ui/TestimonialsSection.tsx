'use client';

import { useTestimonials } from '../logic/useTestimonials';

const testimonials = [
  {
    name: 'Budi Santoso',
    initials: 'BS',
    role: 'Pemilik Toko Sejahtera, Solo',
    text: 'Sejak pakai Kasir Retail KASIRSOLO, omzet toko saya naik 30%. Stok terkontrol, laporan jelas, dan yang paling penting bayar sekali doang!',
    stars: 5,
  },
  {
    name: 'Siti Aminah',
    initials: 'SA',
    role: 'Pengelola Apotek Sehat, Semarang',
    text: 'Expired date tracking-nya sangat membantu. Tidak ada lagi obat kadaluarsa yang terlewat. Support WA-nya juga responsif banget.',
    stars: 5,
  },
  {
    name: 'Ahmad Fauzi',
    initials: 'AF',
    role: 'Takmir Masjid Al-Ikhlas, Sukoharjo',
    text: 'Alhamdulillah laporan keuangan masjid sekarang transparan. Jamaah bisa lihat langsung pemasukan dan pengeluaran. Harganya juga sangat terjangkau.',
    stars: 5,
  },
  {
    name: 'Dewi Rahayu',
    initials: 'DR',
    role: 'Pemilik Bengkel Jaya Motor, Blora',
    text: 'Antrian service jadi teratur, stok sparepart terpantau. Pelanggan juga senang karena ada riwayat service kendaraan mereka.',
    stars: 5,
  },
  {
    name: 'Hendra Wijaya',
    initials: 'HW',
    role: 'Owner Konveksi Batik Jawa, Pekalongan',
    text: 'Tracking order dari desain sampai pengiriman jadi mudah. HPP otomatis terhitung, profit margin lebih jelas. Recommended!',
    stars: 5,
  },
];

export function TestimonialsSection() {
  const { scrollRef, scrollLeft, scrollRight } = useTestimonials();

  return (
    <section className="testimonials-section" id="testimoni">
      <div className="container text-center">
        <span className="section-badge">{'\uD83D\uDCAC'} Testimoni</span>
        <h2 className="section-title">
          Dipercaya <span className="gradient-text">Ratusan</span> Pelaku Usaha
        </h2>
        <p className="section-subtitle">
          Dengarkan cerita sukses mereka yang sudah menggunakan KASIRSOLO untuk
          bisnis mereka.
        </p>
      </div>

      <div className="testimonials-scroll-wrapper">
        <div className="testimonials-scroll" ref={scrollRef}>
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <span key={si}>{'\u2B50'}</span>
                ))}
              </div>
              <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="testimonial-nav">
        <button
          className="testimonial-nav-btn"
          onClick={scrollLeft}
          aria-label="Scroll kiri"
        >
          &#8592;
        </button>
        <button
          className="testimonial-nav-btn"
          onClick={scrollRight}
          aria-label="Scroll kanan"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}
