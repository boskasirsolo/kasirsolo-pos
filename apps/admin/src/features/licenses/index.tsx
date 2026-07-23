"use client";

import { useState } from "react";
import { useLicenses } from "./logic/useLicenses";
import LicenseTable from "./ui/LicenseTable";
import GenerateKeyForm from "./ui/GenerateKeyForm";

export default function LicensesFeature() {
  const { licenses, total, loading, filter, setFilter, refresh, revoke } = useLicenses();
  const [showGenerate, setShowGenerate] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-900">Manajemen Lisensi</h2>
          <p className="text-sm text-gray-500">Kelola lisensi dan generate activation key</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </svg>
          Generate Key
        </button>
      </div>

      <LicenseTable
        licenses={licenses}
        loading={loading}
        filter={filter}
        total={total}
        onFilterChange={setFilter}
        onRevoke={revoke}
      />

      <GenerateKeyForm
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onSuccess={() => {
          refresh();
        }}
      />
    </div>
  );
}
