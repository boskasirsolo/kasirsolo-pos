"use client";

import { useRouter } from "next/navigation";
import { PosShell } from "@/components/layout/PosShell";
import { TransactionList, useTransactions } from "@/features/transactions";
import type { PosTransaction } from "@/lib/db";

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions, loading, todayTotal, todayCount } = useTransactions();

  function handleSelect(tx: PosTransaction) {
    router.push(`/transactions/${tx.id}`);
  }

  return (
    <PosShell>
      <TransactionList
        transactions={transactions}
        loading={loading}
        todayTotal={todayTotal}
        todayCount={todayCount}
        onSelect={handleSelect}
      />
    </PosShell>
  );
}
