'use client';

import { waLink } from '@/lib/wa';
import { useFloatingUI } from '../logic/useFloatingUI';

const WA_MESSAGE = 'Halo KASIRSOLO, saya tertarik dengan aplikasi kasir Anda.';

export function MobileCta() {
  const { showMobileCta } = useFloatingUI();

  if (!showMobileCta) return null;

  return (
    <div className="mobile-cta">
      <a href="#trial" className="btn btn-primary">
        Coba Gratis
      </a>
      <a
        href={waLink(WA_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-wa"
      >
        Chat WA
      </a>
    </div>
  );
}
