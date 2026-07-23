"use client";

import { useState } from "react";
import { Button, Input } from "@kasirsolo/ui";
import { BRAND_NAME } from "@kasirsolo/utils";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onStartTrial: () => void;
  error: string | null;
  loading: boolean;
}

export function LoginForm({ onSubmit, onStartTrial, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    await onSubmit(email, password);
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white">
            KASIR<span className="text-brand-primary">SOLO</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Retail</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                text-white placeholder:text-gray-500 text-base
                focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                  text-white placeholder:text-gray-500 text-base pr-12
                  focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
          >
            Masuk
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">atau</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Trial button */}
        <button
          onClick={onStartTrial}
          className="w-full py-3 rounded-xl border border-brand-accent/30 text-brand-accent
            text-sm font-medium hover:bg-brand-accent/5 transition-colors"
          type="button"
        >
          Coba Gratis 7 Hari
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-8">
          {BRAND_NAME} Retail &middot; PT Mesin Kasir Solo
        </p>
      </div>
    </div>
  );
}
