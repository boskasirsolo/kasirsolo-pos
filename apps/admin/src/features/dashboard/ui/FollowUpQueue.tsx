"use client";

import { formatDate } from "@/lib/utils";
import type { FollowUpItem } from "../data/types";
import { SkeletonCard, SkeletonList } from "@/components/SkeletonLoader";

interface FollowUpQueueProps {
  items: FollowUpItem[];
  loading: boolean;
}

export default function FollowUpQueue({ items, loading }: FollowUpQueueProps) {
  if (loading) {
    return <SkeletonList title="Antrian Follow Up" count={3} />;
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-gray-900">Antrian Follow Up</h3>
        <span className="badge-warning">{items.length} trial</span>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Tidak ada trial yang perlu di-follow up</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-3 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.clientName}</p>
                <p className="text-xs text-gray-500">{item.phone}</p>
              </div>
              <div className="ml-3 text-right">
                <span
                  className={
                    item.daysLeft <= 0
                      ? "badge-danger"
                      : item.daysLeft <= 2
                        ? "badge-warning"
                        : "badge-info"
                  }
                >
                  {item.daysLeft <= 0 ? "Expired" : `${item.daysLeft} hari lagi`}
                </span>
                <p className="mt-1 text-[10px] text-gray-400">{formatDate(item.trialExpires)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
