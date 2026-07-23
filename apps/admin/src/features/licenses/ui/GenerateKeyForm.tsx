"use client";

import { useState } from "react";
import { useGenerateKey } from "../logic/useGenerateKey";

interface GenerateKeyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GenerateKeyForm({ isOpen, onClose, onSuccess }: GenerateKeyFormProps) {
  const { loading, generatedKey, error, generate, reset } = useGenerateKey();
  const [clientId, setClientId] = useState("");
  const [appId, setAppId] = useState("");
  const [planType, setPlanType] = useState("basic");
  const [maxDevices, setMaxDevices] = useState(1);
  const [amountPaid, setAmountPaid] = useState(0);
  const [duration, setDuration] = useState("1year");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let expiresAt: string | null = null;
    if (duration !== "lifetime") {
      const months = duration === "1month" ? 1 : duration === "6months" ? 6 : 12;
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      expiresAt = date.toISOString();
    }

    const result = await generate({ clientId, appId, planType, maxDevices, amountPaid, expiresAt });
    if (result) {
      onSuccess();
    }
  };

  const handleClose = () => {
    reset();
    setClientId("");
    setAppId("");
    setPlanType("basic");
    setMaxDevices(1);
    setAmountPaid(0);
    setDuration("1year");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h3 className="font-heading text-lg font-semibold text-gray-900">Generate Activation Key</h3>
          <button onClick={handleClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {generatedKey ? (
          <KeyDisplay licenseKey={generatedKey} onClose={handleClose} />
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Client ID *</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="UUID klien"
                  required
                  className="input font-mono text-sm"
                />
              </div>

              <div>
                <label className="label">App ID *</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="UUID aplikasi"
                  required
                  className="input font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Paket</label>
                  <select value={planType} onChange={(e) => setPlanType(e.target.value)} className="input">
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
                <div>
                  <label className="label">Max Perangkat</label>
                  <input
                    type="number"
                    value={maxDevices}
                    onChange={(e) => setMaxDevices(Number(e.target.value))}
                    min={1}
                    max={10}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Jumlah Bayar (IDR)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    min={0}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Durasi</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input">
                    <option value="1month">1 Bulan</option>
                    <option value="6months">6 Bulan</option>
                    <option value="1year">1 Tahun</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="btn-secondary">Batal</button>
              <button type="submit" disabled={loading || !clientId || !appId} className="btn-primary">
                {loading ? "Generating..." : "Generate Key"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function KeyDisplay({ licenseKey, onClose }: { licenseKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Berikut activation key KASIRSOLO Anda:\n\n*${licenseKey}*\n\nSilakan masukkan key ini di aplikasi untuk mengaktifkan lisensi.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="p-6 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h4 className="font-heading text-lg font-semibold text-gray-900">Key Berhasil Dibuat!</h4>
      <div className="my-4 rounded-xl bg-gray-50 p-4">
        <code className="font-mono text-2xl font-bold tracking-wider text-brand-primary">
          {licenseKey}
        </code>
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={handleCopy} className="btn-secondary">
          {copied ? "Tersalin!" : "Copy Key"}
        </button>
        <button onClick={handleWhatsApp} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          Kirim via WA
        </button>
      </div>
      <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
        Tutup
      </button>
    </div>
  );
}
