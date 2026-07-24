'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useDeviceBinding, LoginForm, ActivationScreen } from '@/features/auth';
import { startTrial, checkTrialExpiry } from '@kasirsolo/auth/license';
import { openDatabase } from '@/lib/db';
import { useState, useEffect } from 'react';

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
  } = useDeviceBinding();

  const [showActivation, setShowActivation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && bound) {
      router.replace('/pos');
    }
  }, [isAuthenticated, bound, router]);

  async function handleLogin(email: string, password: string) {
    try {
      setError(null);
      await login(email, password);

      // Initialize IndexedDB
      await openDatabase();

      // After login, check device binding
      // If not bound, show activation
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
      router.replace('/pos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai trial');
    }
  }

  async function handleActivate(licenseKey: string) {
    try {
      setError(null);
      await activate(licenseKey);
      await openDatabase();
      router.replace('/pos');
    } catch {
      // Error handled by useDeviceBinding
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
      <ActivationScreen
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
