"use client";

import { useRouter } from "next/navigation";
import { useAuth, useActivation, LoginForm, ActivationForm } from "@/features/auth";
import { startTrial } from "@/lib/license";
import { openDatabase } from "@/lib/db";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError, loginLoading, isAuthenticated } = useAuth();
  const {
    bound,
    activate,
    activateTrial,
    activating,
    error: deviceError,
    loading: deviceLoading,
  } = useActivation();

  const [showActivation, setShowActivation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && bound) {
      router.replace("/pos");
    }
  }, [isAuthenticated, bound, router]);

  async function handleLogin(email: string, password: string) {
    try {
      setError(null);
      await login(email, password);
      await openDatabase();
      setShowActivation(true);
    } catch {
      // Error handled by useAuth
    }
  }

  async function handleStartTrial() {
    try {
      setError(null);
      startTrial();
      await openDatabase();
      activateTrial();
      router.replace("/pos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai trial");
    }
  }

  async function handleActivate(licenseKey: string) {
    try {
      setError(null);
      await activate(licenseKey);
      await openDatabase();
      router.replace("/pos");
    } catch {
      // Error handled by useActivation
    }
  }

  if (deviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showActivation && isAuthenticated && !bound) {
    return (
      <ActivationForm
        onActivate={handleActivate}
        onStartTrial={handleStartTrial}
        loading={activating}
        error={deviceError ?? error}
      />
    );
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      onStartTrial={handleStartTrial}
      error={authError ?? error}
      loading={loginLoading}
    />
  );
}
