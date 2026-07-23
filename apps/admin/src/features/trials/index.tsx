"use client";

import { useTrials } from "./logic/useTrials";
import TrialList from "./ui/TrialList";
import type { TrialTab } from "./data/types";

const tabs: { key: TrialTab; label: string }[] = [
  { key: "active", label: "Aktif" },
  { key: "expiring", label: "Segera Habis" },
  { key: "expired", label: "Expired" },
  { key: "extended", label: "Diperpanjang" },
  { key: "locked", label: "Locked" },
];

export default function TrialsFeature() {
  const { tab, setTab, stats, clients, loading, error, extend, lock } = useTrials();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">Antrian Trial</h2>
        <p className="text-sm text-gray-500">Pantau dan kelola trial klien</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-xl border border-surface-border bg-white p-1">
        {tabs.map((t) => {
          const count = stats[t.key];
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <TrialList
        clients={clients}
        loading={loading}
        onExtend={extend}
        onLock={lock}
      />
    </div>
  );
}
