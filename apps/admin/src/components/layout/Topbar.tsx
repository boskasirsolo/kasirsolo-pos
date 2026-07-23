"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Manajemen Klien",
  "/licenses": "Manajemen Lisensi",
  "/devices": "Manajemen Perangkat",
  "/payments": "Pembayaran",
  "/apps": "Katalog Aplikasi",
  "/trials": "Antrian Trial",
  "/analytics": "Analitik",
  "/logs": "Log Aktivitas",
  "/settings": "Pengaturan",
};

const breadcrumbMap: Record<string, string[]> = {
  "/": ["Dashboard"],
  "/clients": ["Dashboard", "Klien"],
  "/licenses": ["Dashboard", "Lisensi"],
  "/devices": ["Dashboard", "Perangkat"],
  "/payments": ["Dashboard", "Pembayaran"],
  "/apps": ["Dashboard", "Aplikasi"],
  "/trials": ["Dashboard", "Trial"],
  "/analytics": ["Dashboard", "Analitik"],
  "/logs": ["Dashboard", "Log"],
  "/settings": ["Dashboard", "Pengaturan"],
};

export default function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";
  const breadcrumbs = breadcrumbMap[pathname] ?? ["Dashboard"];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-surface-border bg-white px-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">{title}</h2>
        <nav className="flex items-center gap-1 text-xs text-gray-400">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumbs.length - 1 ? "text-gray-600" : ""}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Notifikasi"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary" />
        </button>

        {/* Quick Search */}
        <div className="hidden items-center gap-2 rounded-lg border border-surface-border bg-surface-secondary px-3 py-1.5 text-sm text-gray-400 md:flex">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span>Cari...</span>
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            Ctrl+K
          </kbd>
        </div>
      </div>
    </header>
  );
}
