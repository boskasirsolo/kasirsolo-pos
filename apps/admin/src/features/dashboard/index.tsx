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
    handleApprove,
    handleReject,
    followUpPage,
    setFollowUpPage,
    paymentsPage,
    setPaymentsPage,
    activationsPage,
    setActivationsPage,
    activityPage,
    setActivityPage,
  } = useDashboard();

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => fetchAll()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Now
        </button>
      </div>

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
        <FollowUpQueue
          items={followUps}
          loading={loading}
          onPageChange={(page) => setFollowUpPage(page)}
          currentPage={followUpPage}
        />
        <PendingPayments
          items={pendingPayments}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onPageChange={(page) => setPaymentsPage(page)}
          currentPage={paymentsPage}
        />
      </div>

      {/* Three Column: Activations + App Popularity + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivations
          items={recentActivations}
          loading={loading}
          onPageChange={(page) => setActivationsPage(page)}
          currentPage={activationsPage}
        />
        <AppPopularity items={appPopularity} loading={loading} />
        <ActivityFeed
          items={activityFeed}
          loading={loading}
          onPageChange={(page) => setActivityPage(page)}
          currentPage={activityPage}
        />
      </div>
    </div>
  );
}
