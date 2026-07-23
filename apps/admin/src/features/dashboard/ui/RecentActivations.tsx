"use client";

import { formatDate } from "@/lib/utils";
import type { RecentActivation } from "../data/types";
import { SkeletonCard, SkeletonList } from "@/components/SkeletonLoader";

interface RecentActivationsProps {
  items: RecentActivation[];
  loading: boolean;
}

export default function RecentActivations({ items, loading }: RecentActivationsProps) {
  if (loading) {
    return <SkeletonList title="Aktivasi Terbaru" variant="list-item" count={3} />;
  }

  return (
    <div className="card">
      <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Aktivasi Terbaru</h3>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Belum ada aktivasi terbaru</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-3 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.clientName}</p>
                <p className="text-xs text-gray-500">
                  {item.appName} - <span className="font-mono text-[10px]">{item.licenseKey}</span>
                </p>
              </div>
              <div className="ml-3 text-right">
                <span className="badge-success capitalize">{item.planType}</span>
                <p className="mt-1 text-[10px] text-gray-400">{formatDate(item.activatedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
