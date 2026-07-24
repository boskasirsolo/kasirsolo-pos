'use client';

import { useState } from 'react';
import { StoreSettings } from './StoreSettings';
import { ReceiptSettings } from './ReceiptSettings';
import { DeviceSettings } from './DeviceSettings';
import { AccountSettings } from './AccountSettings';
import { AboutSection } from './AboutSection';
import type { SettingsTab } from '../data/types';
import type { PosSettings } from '@/lib/db';
import type { LicenseStatus } from '@kasirsolo/auth/license';

interface SettingsPageProps {
  settings: PosSettings | null;
  licenseStatus: LicenseStatus | null;
  onUpdateSettings: (updates: Partial<PosSettings>) => Promise<void>;
  onLogout: () => void;
  saving: boolean;
}

export function SettingsPage({
  settings,
  licenseStatus,
  onUpdateSettings,
  onLogout,
  saving,
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');

  const tabs: { value: SettingsTab; label: string; icon: string }[] = [
    {
      value: 'store',
      label: 'Toko',
      icon: 'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z',
    },
    {
      value: 'receipt',
      label: 'Struk',
      icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z',
    },
    {
      value: 'account',
      label: 'Akun',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    },
    {
      value: 'device',
      label: 'Perangkat',
      icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
    },
    {
      value: 'about',
      label: 'Tentang',
      icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
    },
  ];

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto scrollbar-hide bg-white border-b border-pos-border px-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex flex-col items-center gap-1 px-4 py-3 shrink-0 border-b-2 transition-colors
              ${
                activeTab === tab.value
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500'
              }`}
            type="button"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'store' && settings && (
          <StoreSettings settings={settings} onUpdate={onUpdateSettings} saving={saving} />
        )}
        {activeTab === 'receipt' && settings && (
          <ReceiptSettings settings={settings} onUpdate={onUpdateSettings} saving={saving} />
        )}
        {activeTab === 'account' && <AccountSettings onLogout={onLogout} />}
        {activeTab === 'device' && <DeviceSettings licenseStatus={licenseStatus} />}
        {activeTab === 'about' && <AboutSection />}
      </div>
    </div>
  );
}
