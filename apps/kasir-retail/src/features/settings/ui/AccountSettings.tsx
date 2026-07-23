"use client";

import { Button } from "@kasirsolo/ui";
import { useAuth } from "@/features/auth";

interface AccountSettingsProps {
  onLogout: () => void;
}

export function AccountSettings({ onLogout }: AccountSettingsProps) {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-heading font-bold text-gray-900">Akun</h3>

      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-brand-primary">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name || "Pengguna"}</p>
            <p className="text-xs text-gray-500">{user?.email || "-"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-xl border border-red-200 p-4 text-left
            flex items-center gap-3 active:bg-red-50 transition-colors"
          type="button"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span className="text-sm font-medium text-red-600">Keluar / Logout</span>
        </button>
      </div>
    </div>
  );
}
