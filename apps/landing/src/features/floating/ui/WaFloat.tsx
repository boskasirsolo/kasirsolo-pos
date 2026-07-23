'use client';

import { useFloatingUI } from '../logic/useFloatingUI';

const WA_NUMBER = '628816566935';
const WA_MESSAGE = encodeURIComponent(
  'Halo KASIRSOLO, saya tertarik dengan aplikasi kasir Anda. Bisa info lebih lanjut?'
);

export function WaFloat() {
  const { showWa, showTooltip, dismissTooltip } = useFloatingUI();

  if (!showWa) return null;

  return (
    <div className="wa-float">
      {showTooltip && (
        <div className="wa-float-tooltip">
          Ada yang bisa kami bantu?
          <button className="wa-float-close" onClick={dismissTooltip}>
            &#10005;
          </button>
        </div>
      )}
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float-btn"
        aria-label="Chat WhatsApp"
      >
        {'\uD83D\uDCAC'}
      </a>
    </div>
  );
}
