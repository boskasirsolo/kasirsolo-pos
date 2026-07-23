'use client';

import { appsData } from '../data/queries';
import { useAppCatalog } from '../logic/useAppCatalog';
import { FilterTabs } from './FilterTabs';
import { AppCard } from './AppCard';
import { AppDetailModal } from './AppDetailModal';

export function AppGrid() {
  const {
    activeFilter,
    setActiveFilter,
    filteredApps,
    selectedApp,
    openModal,
    closeModal,
  } = useAppCatalog(appsData);

  return (
    <section className="app-catalog" id="aplikasi">
      <div className="container text-center">
        <span className="section-badge">
          {'\uD83D\uDCBB'} Katalog Aplikasi
        </span>
        <h2 className="section-title">
          Pilih Aplikasi <span className="gradient-text">Sesuai Kebutuhan</span>
        </h2>
        <p className="section-subtitle">
          8 aplikasi siap pakai untuk berbagai jenis bisnis dan institusi. Semua
          dengan model bayar sekali, pakai seumur hidup.
        </p>
      </div>

      <FilterTabs active={activeFilter} onChange={setActiveFilter} />

      <div className="app-grid">
        {filteredApps.map((app) => (
          <AppCard key={app.id} app={app} onClick={openModal} />
        ))}
      </div>

      <AppDetailModal app={selectedApp} onClose={closeModal} />
    </section>
  );
}
