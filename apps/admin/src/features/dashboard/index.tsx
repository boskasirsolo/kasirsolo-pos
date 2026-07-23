"use client";

import { useDashboard } from "./logic/useDashboard";
import DashboardGrid from "./ui/DashboardGrid";
import FollowUpQueue from "./ui/FollowUpQueue";
import PendingPayments from "./ui/PendingPayments";
import RecentActivations from "./ui/RecentActivations";
import AppPopularity from "./ui/AppPopularity";
import ActivityFeed from "./ui/ActivityFeed";

export default function DashboardFeature() {
  const {
    stats,
    followUps,
    pendingPayments,
    recentActivations,
    appPopularity,
    activityFeed,
    loading,
    error,
    refresh,
  } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={refresh} className="text-sm font-medium text-red-700 underline hover:text-red-800">
            Coba lagi
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <DashboardGrid stats={stats} loading={loading} />

      {/* Two Column: Follow Up + Pending Payments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FollowUpQueue items={followUps} loading={loading} />
        <PendingPayments items={pendingPayments} loading={loading} />
      </div>

      {/* Three Column: Activations + App Popularity + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivations items={recentActivations} loading={loading} />
        <AppPopularity items={appPopularity} loading={loading} />
        <ActivityFeed items={activityFeed} loading={loading} />
      </div>
    </div>
  );
}
