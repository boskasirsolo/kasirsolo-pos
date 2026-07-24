'use client';

import { useState } from 'react';
import { Button } from '@kasirsolo/ui';
import { BRAND_NAME, formatRupiah, isValidKey, waSupportLink } from '@kasirsolo/utils';
// FNB-specific constants (overridable via AuthConfig)
const PRICE = 350000;
const MAX_DEVICES = 2;

interface ActivationFormProps {
  onActivate: (licenseKey: string) => Promise<void>;
  onStartTrial: () => void;
  loading: boolean;
  error: string | null;
}

export function ActivationForm({ onActivate, onStartTrial, loading, error }: ActivationFormProps) {
  const [key, setKey] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);

  function handleKeyChange(value: string) {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    if (cleaned.length > 0 && !cleaned.startsWith('KSP-')) {
      if (cleaned.startsWith('KSP')) {
        cleaned = 'KSP-' + cleaned.slice(3);
      }
    }

    setKey(cleaned);
    setKeyError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidKey(key)) {
      setKeyError('Format kode lisensi tidak valid. Format: KSP-XXXX-XXXX-XXXX');
      return;
    }

    await onActivate(key);
  }

  const waUrl = waSupportLink('Saya ingin membeli lisensi KASIRSOLO F&B', undefined, 'kasir-fnb');

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold text-white mb-2">Aktivasi Perangkat</h1>
          <p className="text-gray-400 text-sm">Masukkan kode lisensi atau mulai trial gratis</p>
        </div>

        {/* License Key Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Kode Lisensi</label>
            <input
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="KSP-XXXX-XXXX-XXXX"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                text-white placeholder:text-gray-500 text-base font-mono tracking-wider text-center
                focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              maxLength={19}
              autoComplete="off"
            />
            {keyError && <p className="text-red-400 text-xs mt-1">{keyError}</p>}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            Aktivasi
          </Button>
        </form>

        {/* Product Info */}
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">{BRAND_NAME} F&B</span>
            <span className="text-lg font-bold text-brand-accent">{formatRupiah(PRICE)}</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>Sekali bayar, pakai selamanya</li>
            <li>Maks {MAX_DEVICES} perangkat</li>
            <li>Kitchen Display System</li>
            <li>Manajemen meja & split bill</li>
            <li>Offline-first, data di perangkat</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onStartTrial}
            className="w-full py-3 rounded-xl border border-brand-accent/30 text-brand-accent
              text-sm font-medium hover:bg-brand-accent/5 transition-colors"
            type="button"
          >
            Coba Gratis 7 Hari (Tanpa Lisensi)
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl text-gray-400 text-sm
              hover:text-white transition-colors"
          >
            Beli Lisensi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
