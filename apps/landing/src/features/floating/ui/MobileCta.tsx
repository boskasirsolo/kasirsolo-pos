'use client';

import { useFloatingUI } from '../logic/useFloatingUI';

const WA_NUMBER = '628816566935';
const WA_MESSAGE = encodeURIComponent(
  'Halo KASIRSOLO, saya tertarik dengan aplikasi kasir Anda.'
);

export function MobileCta() {
  const { showMobileCta } = useFloatingUI();

  if (!showMobileCta) return null;

  return (
    <div className="mobile-cta">
      <a href="#trial" className="btn btn-primary">
        Coba Gratis
      </a>
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-wa"
      >
        Chat WA
      </a>
    </div>
  );
}
