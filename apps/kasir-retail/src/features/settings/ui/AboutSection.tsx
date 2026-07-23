"use client";

import { BRAND_NAME, COMPANY_NAME, WA_DISPLAY, waSupportLink } from "@kasirsolo/utils";

export function AboutSection() {
  const waUrl = waSupportLink("Pertanyaan tentang KASIRSOLO Retail");

  return (
    <div className="space-y-4">
      <div className="text-center py-6">
        <h2 className="text-2xl font-heading font-bold text-gray-900">
          KASIR<span className="text-brand-primary">SOLO</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1">Retail</p>
        <p className="text-xs text-gray-400 mt-0.5">Versi 1.0.0</p>
      </div>

      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Tentang Aplikasi</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          {BRAND_NAME} Retail adalah aplikasi kasir offline-first untuk toko, warung, dan retail.
          Semua data tersimpan di perangkat Anda sehingga tetap dapat digunakan tanpa internet.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Developer</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Perusahaan</span>
            <span className="text-gray-700">{COMPANY_NAME}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">WhatsApp</span>
            <span className="text-gray-700">{WA_DISPLAY}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-white rounded-xl border border-pos-border p-4 text-left
            flex items-center gap-3 active:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          <div>
            <span className="text-sm font-medium text-gray-900">Hubungi Support</span>
            <p className="text-xs text-gray-400">Chat via WhatsApp</p>
          </div>
        </a>
      </div>

      <p className="text-center text-[10px] text-gray-400 pb-4">
        &copy; 2026 {COMPANY_NAME}. All rights reserved.
      </p>
    </div>
  );
}
