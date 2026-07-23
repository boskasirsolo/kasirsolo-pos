'use client';

import { useRef, useEffect } from 'react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#aplikasi', label: 'Aplikasi' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#harga', label: 'Harga' },
  { href: '#testimoni', label: 'Testimoni' },
  { href: '#faq', label: 'FAQ' },
];

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
      <div className="mobile-nav-overlay" onClick={onClose} />
      <div className="mobile-nav-panel" ref={panelRef}>
        <button className="mobile-nav-close" onClick={onClose} aria-label="Tutup menu">
          &#10005;
        </button>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="mobile-nav-link"
            onClick={handleLinkClick}
          >
            {link.label}
          </a>
        ))}
        <a href="#trial" className="mobile-nav-cta" onClick={handleLinkClick}>
          Coba Gratis
        </a>
      </div>
    </div>
  );
}
