import { waLink } from '@/lib/wa';

const productLinks = [
  { href: '#aplikasi', label: 'Kasir Retail' },
  { href: '#aplikasi', label: 'Bengkel + Sparepart' },
  { href: '#aplikasi', label: 'Apotek' },
  { href: '#aplikasi', label: 'Manajemen Masjid' },
  { href: '#aplikasi', label: 'Semua Aplikasi' },
];

const companyLinks = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#harga', label: 'Harga' },
  { href: '#testimoni', label: 'Testimoni' },
  { href: '#faq', label: 'FAQ' },
  { href: '#trial', label: 'Trial Gratis' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Column */}
          <div>
            <div className="footer-brand">
              <div className="footer-brand-icon">K</div>
              KASIR<span>SOLO</span>
            </div>
            <p className="footer-desc">
              Aplikasi kasir & manajemen bisnis terlengkap oleh PT Mesin Kasir
              Solo. Bayar sekali, pakai seumur hidup.
            </p>
            <div className="footer-social">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
                aria-label="WhatsApp"
              >
                {'\uD83D\uDCAC'}
              </a>
              <a
                href="mailto:owner.kasirsolo@gmail.com"
                className="footer-social-link"
                aria-label="Email"
              >
                {'\u2709\uFE0F'}
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="footer-col">
            <h4>Produk</h4>
            <div className="footer-links">
              {productLinks.map((link, i) => (
                <a key={i} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Company Column */}
          <div className="footer-col">
            <h4>Perusahaan</h4>
            <div className="footer-links">
              {companyLinks.map((link, i) => (
                <a key={i} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Address Column */}
          <div className="footer-col">
            <h4>Alamat</h4>

            <div style={{ marginBottom: 16 }}>
              <div className="footer-address-label">Alamat Legal</div>
              <p className="footer-address">
                Perum Graha Tiara 2 B1 Gumpang 07/01, Kartasura, Sukoharjo,
                Jawa Tengah 57169
              </p>
              <a
                href="https://maps.app.goo.gl/DtNwuJvY9KufJN3CA"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-map-link"
              >
                {'\uD83D\uDCCD'} Lihat di Google Maps
              </a>
            </div>

            <div>
              <div className="footer-address-label">Alamat Operasional</div>
              <p className="footer-address">
                Gumiring 04/04, Sidomulyo, Banjarejo, Blora, Jawa Tengah 58253
              </p>
              <a
                href="https://maps.app.goo.gl/F9YMpuBUPMd1tcNWA"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-map-link"
              >
                {'\uD83D\uDCCD'} Lihat di Google Maps
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">
            &copy; {currentYear} KASIRSOLO by PT Mesin Kasir Solo. All rights
            reserved.
          </span>
          <div className="footer-legal">
            <a href="#">Kebijakan Privasi</a>
            <a href="#">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
