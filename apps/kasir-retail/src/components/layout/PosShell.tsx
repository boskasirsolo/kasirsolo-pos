'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { LockScreen } from './LockScreen';
import { getLicenseStatus, type LicenseStatus } from '@kasirsolo/auth/license';
import { getCurrentUser, type AuthUser } from '@kasirsolo/auth';

// Retail app-specific auth config
const RETAIL_AUTH_CONFIG = { prefix: 'kasirsolo' };

interface PosShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function PosShell({ children, hideNav = false }: PosShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [currentUser, status] = await Promise.all([
          getCurrentUser(),
          getLicenseStatus(RETAIL_AUTH_CONFIG),
        ]);

        if (!currentUser) {
          router.replace('/login');
          return;
        }

        setUser(currentUser);
        setLicenseStatus(status);
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pos-bg">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show lock screen if license/trial expired
  if (licenseStatus && !licenseStatus.valid && licenseStatus.type !== 'none') {
    return <LockScreen status={licenseStatus} />;
  }

  return (
    <div className="min-h-screen bg-pos-bg flex flex-col">
      <TopBar storeName={user?.name ?? 'KASIRSOLO Retail'} licenseStatus={licenseStatus} />
      <main className={`flex-1 ${!hideNav ? 'pb-safe' : ''}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
