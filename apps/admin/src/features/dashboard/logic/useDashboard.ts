"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  getDashboardStats,
  getFollowUpQueue,
  getPendingPayments,
  getRecentActivations,
  getAppPopularity,
  getRecentActivity,
  getFollowUpTotalCount,
  getPendingPaymentsTotalCount,
  getRecentActivationsTotalCount,
  getActivityTotalCount,
} from "../data/queries";
import type {
  DashboardStats,
  FollowUpItem,
  PendingPaymentItem,
  RecentActivation,
  AppPopularityItem,
  ActivityLogEntry,
} from "../data/types";

const PAGE_SIZE = 10;

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentItem[]>([]);
  const [recentActivations, setRecentActivations] = useState<RecentActivation[]>([]);
  const [appPopularity, setAppPopularity] = useState<AppPopularityItem[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [followUpPage, setFollowUpPage] = useState(0);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [activationsPage, setActivationsPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);

  // Track whether data is still loading initially
  const initialLoadDone = useRef(false);

  const fetchAll = useCallback(async (pageOverrides?: {
    followUp?: number;
    payments?: number;
    activations?: number;
    activity?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      const p = pageOverrides ?? {};

      const [
        statsData,
        followUpData,
        paymentsData,
        activationsData,
        popularityData,
        activityData,
        followUpTotal,
        paymentsTotal,
        activationsTotal,
        activityTotal,
      ] = await Promise.all([
        getDashboardStats(supabase),
        getFollowUpQueue(supabase, p.followUp ?? followUpPage, PAGE_SIZE),
        getPendingPayments(supabase, p.payments ?? paymentsPage, PAGE_SIZE),
        getRecentActivations(supabase, p.activations ?? activationsPage, PAGE_SIZE),
        getAppPopularity(supabase),
        getRecentActivity(supabase, p.activity ?? activityPage, PAGE_SIZE),
        getFollowUpTotalCount(supabase),
        getPendingPaymentsTotalCount(supabase),
        getRecentActivationsTotalCount(supabase),
        getActivityTotalCount(supabase),
      ]);

      setStats(statsData);
      setFollowUps(followUpData);
      setPendingPayments(paymentsData);
      setRecentActivations(activationsData);
      setAppPopularity(popularityData);
      setActivityFeed(activityData);

      // Expose totals for "load more" calculation
      return {
        followUpTotal: followUpTotal ?? 0,
        paymentsTotal: paymentsTotal ?? 0,
        activationsTotal: activationsTotal ?? 0,
        activityTotal: activityTotal ?? 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [followUpPage, paymentsPage, activationsPage, activityPage]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchAll();
    }
  }, [fetchAll]);

  // Re-fetch when any page state changes (for "Load More")
  useEffect(() => {
    fetchAll();
  }, [followUpPage, paymentsPage, activationsPage, activityPage, fetchAll]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Reset to page 0 on auto-refresh
      setFollowUpPage(0);
      setPaymentsPage(0);
      setActivationsPage(0);
      setActivityPage(0);
      fetchAll();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const handleApprove = useCallback(async (paymentId: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await supabase
        .from("ksp_payments")
        .update({ status: "verified" })
        .eq("id", paymentId);
      fetchAll();
    } catch (err) {
      console.error("Failed to approve payment:", err);
      setError("Gagal menyetujui pembayaran: " + (err instanceof Error ? err.message : "unknown"));
    }
  }, [fetchAll]);

  const handleReject = useCallback(async (paymentId: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await supabase
        .from("ksp_payments")
        .update({ status: "rejected" })
        .eq("id", paymentId);
      fetchAll();
    } catch (err) {
      console.error("Failed to reject payment:", err);
      setError("Gagal menolak pembayaran: " + (err instanceof Error ? err.message : "unknown"));
    }
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
  };
}
