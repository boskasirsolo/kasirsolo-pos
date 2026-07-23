"use client";

import { Button } from "@kasirsolo/ui";
import { waSupportLink, BRAND_NAME, formatRupiah } from "@kasirsolo/utils";
import type { LicenseStatus } from "@/lib/license";
import { PRICE } from "@/lib/license";

interface LockScreenProps {
  status: LicenseStatus;
}

export function LockScreen({ status }: LockScreenProps) {
  const waUrl = waSupportLink(
    "Saya ingin membeli lisensi KASIRSOLO F&B",
    undefined,
    "kasir-fnb"
  );

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        {/* Lock icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="text-2xl font-heading font-bold text-white mb-2">
          {status.type === "expired" ? "Masa Trial Berakhir" : "Aplikasi Terkunci"}
        </h1>

        <p className="text-gray-400 mb-8">
          {status.message}
        </p>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-300 mb-1">Harga Lisensi {BRAND_NAME} F&B</p>
          <p className="text-2xl font-bold text-brand-accent">
            {formatRupiah(PRICE)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sekali bayar, selamanya</p>
        </div>

        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <Button variant="primary" fullWidth size="lg">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Beli via WhatsApp
            </Button>
          </a>

          <Button
            variant="outline"
            fullWidth
            onClick={() => window.location.href = "/login"}
          >
            Masukkan Kode Lisensi
          </Button>
        </div>
      </div>
    </div>
  );
}
