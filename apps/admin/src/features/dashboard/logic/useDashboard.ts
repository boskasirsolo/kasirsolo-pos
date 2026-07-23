"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  getDashboardStats,
  getFollowUpQueue,
  getPendingPayments,
  getRecentActivations,
  getAppPopularity,
  getRecentActivity,
} from "../data/queries";
import type {
  DashboardStats,
  FollowUpItem,
  PendingPaymentItem,
  RecentActivation,
  AppPopularityItem,
  ActivityLogEntry,
} from "../data/types";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentItem[]>([]);
  const [recentActivations, setRecentActivations] = useState<RecentActivation[]>([]);
  const [appPopularity, setAppPopularity] = useState<AppPopularityItem[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      const [
        statsData,
        followUpData,
        paymentsData,
        activationsData,
        popularityData,
        activityData,
      ] = await Promise.all([
        getDashboardStats(supabase),
        getFollowUpQueue(supabase),
        getPendingPayments(supabase),
        getRecentActivations(supabase),
        getAppPopularity(supabase),
        getRecentActivity(supabase),
      ]);

      setStats(statsData);
      setFollowUps(followUpData);
      setPendingPayments(paymentsData);
      setRecentActivations(activationsData);
      setAppPopularity(popularityData);
      setActivityFeed(activityData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    stats,
    followUps,
    pendingPayments,
    recentActivations,
    appPopularity,
    activityFeed,
    loading,
    error,
    refresh: fetchAll,
  };
}
