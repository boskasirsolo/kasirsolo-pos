'use client';

import { useState } from 'react';
import { useScrollHeader } from '../logic/useScrollHeader';
import { MobileNav } from './MobileNav';

const navLinks = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#aplikasi', label: 'Aplikasi' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#harga', label: 'Harga' },
  { href: '#testimoni', label: 'Testimoni' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  const { isScrolled, progress } = useScrollHeader();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <a href="#" className="header-brand">
            <div className="header-brand-icon">K</div>
            KASIR<span>SOLO</span>
          </a>

          <nav className="header-nav">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <a href="#trial" className="header-cta">
              Coba Gratis
            </a>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
            >
              &#9776;
            </button>
          </div>
        </div>
      </header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
