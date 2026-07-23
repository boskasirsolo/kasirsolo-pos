"use client";

import { copyToClipboard, openWhatsApp } from "@/lib/utils";
import { useState } from "react";

interface KeyDisplayProps {
  licenseKey: string;
  clientPhone?: string;
  clientName?: string;
}

export default function KeyDisplay({ licenseKey, clientPhone, clientName }: KeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(licenseKey);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (!clientPhone) return;
    const message = `Halo ${clientName ?? ""},\n\nBerikut activation key KASIRSOLO Anda:\n\n*${licenseKey}*\n\nSilakan masukkan key ini di aplikasi untuk mengaktifkan lisensi. Hubungi kami jika ada pertanyaan.\n\nTerima kasih!`;
    openWhatsApp(clientPhone, message);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
        {licenseKey}
      </code>
      <button
        onClick={handleCopy}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        title={copied ? "Tersalin!" : "Copy"}
      >
        {copied ? (
          <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
      </button>
      {clientPhone && (
        <button
          onClick={handleWhatsApp}
          className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600"
          title="Kirim via WhatsApp"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </button>
      )}
    </div>
  );
}
