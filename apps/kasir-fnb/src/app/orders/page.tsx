"use client";

import { useState } from "react";
import { FnbShell } from "@/components/layout/FnbShell";
import { OrderList, OrderDetail, useOrders } from "@/features/orders";
import type { FnbTransaction } from "@/features/orders";

export default function OrdersPage() {
  const { transactions, loading, todayTotal, todayCount } = useOrders();
  const [selectedTx, setSelectedTx] = useState<FnbTransaction | null>(null);

  return (
    <FnbShell>
      <OrderList
        transactions={transactions}
        loading={loading}
        todayTotal={todayTotal}
        todayCount={todayCount}
        onSelect={setSelectedTx}
      />
      {selectedTx && (
        <OrderDetail
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </FnbShell>
  );
}
