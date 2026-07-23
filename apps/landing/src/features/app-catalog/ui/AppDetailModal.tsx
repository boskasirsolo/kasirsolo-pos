'use client';

import { useEffect } from 'react';
import type { AppItem } from '../data/types';

interface AppDetailModalProps {
  app: AppItem | null;
  onClose: () => void;
}

const WA_NUMBER = '628816566935';

export function AppDetailModal({ app, onClose }: AppDetailModalProps) {
  useEffect(() => {
    if (app) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [app]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!app) return null;

  const waMessage = encodeURIComponent(
    `Halo KASIRSOLO, saya tertarik dengan aplikasi ${app.name}. Bisa info lebih lanjut?`
  );

  return (
    <div className={`modal-overlay ${app ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &#10005;
        </button>

        <div className="modal-header">
          <div className="modal-icon">{app.icon}</div>
          <div>
            <h3 className="modal-title">{app.name}</h3>
            <span className="modal-category">{app.categoryLabel}</span>
          </div>
        </div>

        <p className="modal-desc">{app.description}</p>

        <div className="modal-features">
          <h4>Fitur Utama</h4>
          <ul>
            {app.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="modal-price">
          <div>
            <div className="modal-price-amount gradient-text">
              {app.priceFormatted}
            </div>
            <div className="modal-price-period">Sekali bayar, seumur hidup</div>
          </div>
        </div>

        <div className="modal-actions">
          <a href="#trial" className="btn btn-primary" onClick={onClose}>
            Coba Gratis
          </a>
          <a
            href={`https://wa.me/${WA_NUMBER}?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa"
          >
            Chat WA
          </a>
        </div>
      </div>
    </div>
  );
}
