"use client";

import { usePayments } from "./logic/usePayments";
import PaymentTable from "./ui/PaymentTable";

export default function PaymentsFeature() {
  const { payments, total, loading, filter, setFilter, changeStatus } = usePayments();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">Manajemen Pembayaran</h2>
        <p className="text-sm text-gray-500">Verifikasi dan kelola pembayaran klien</p>
      </div>

      <PaymentTable
        payments={payments}
        loading={loading}
        filter={filter}
        total={total}
        onFilterChange={setFilter}
        onChangeStatus={changeStatus}
      />
    </div>
  );
}
