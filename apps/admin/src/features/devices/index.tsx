"use client";

import { useDevices } from "./logic/useDevices";
import DeviceTable from "./ui/DeviceTable";

export default function DevicesFeature() {
  const { devices, total, loading, filter, setFilter, deactivate, remove } = useDevices();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">Manajemen Perangkat</h2>
        <p className="text-sm text-gray-500">Monitor dan kelola perangkat terdaftar pada lisensi</p>
      </div>

      <DeviceTable
        devices={devices}
        loading={loading}
        filter={filter}
        total={total}
        onFilterChange={setFilter}
        onDeactivate={deactivate}
        onRemove={remove}
      />
    </div>
  );
}
