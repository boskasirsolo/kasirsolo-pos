'use client';

import { useState, useMemo, useCallback } from 'react';
import type { AppItem } from '../data/types';

export type CategoryFilter = 'semua' | 'bisnis' | 'institusi' | 'kesehatan';

export function useAppCatalog(apps: AppItem[]) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('semua');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);

  const filteredApps = useMemo(() => {
    if (activeFilter === 'semua') return apps;
    return apps.filter((app) => app.category === activeFilter);
  }, [apps, activeFilter]);

  const openModal = useCallback((app: AppItem) => {
    setSelectedApp(app);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedApp(null);
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    filteredApps,
    selectedApp,
    openModal,
    closeModal,
  };
}
