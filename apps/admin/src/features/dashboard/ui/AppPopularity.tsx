"use client";

import type { AppPopularityItem } from "../data/types";
import { SkeletonList } from "@/components/SkeletonLoader";

interface AppPopularityProps {
  items: AppPopularityItem[];
  loading: boolean;
}

const barColors = [
  "bg-brand-primary",
  "bg-brand-secondary",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-cyan-500",
  "bg-pink-500",
];

export default function AppPopularity({ items, loading }: AppPopularityProps) {
  if (loading) {
    return <SkeletonList title="Popularitas Aplikasi" variant="bar-chart" count={4} />;
  }

  const maxCount = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 1;

  return (
    <div className="card">
      <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Popularitas Aplikasi</h3>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Belum ada data aplikasi</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.appId}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">{item.appName}</span>
                <span className="text-gray-500">{item.count} lisensi ({item.percentage}%)</span>
              </div>
              <div className="h-6 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColors[index % barColors.length]}`}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
