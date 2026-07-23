"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PosShell } from "@/components/layout/PosShell";
import { TransactionDetail, useTransactions } from "@/features/transactions";
import { useToast } from "@kasirsolo/ui";
import { getTransactionById } from "@/lib/db";
import type { PosTransaction } from "@/lib/db";

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { voidTransaction, voiding } = useTransactions();
  const { addToast } = useToast();
  const [transaction, setTransaction] = useState<PosTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const tx = await getTransactionById(id);
        setTransaction(tx ?? null);
      } catch {
        addToast({ type: "error", title: "Transaksi tidak ditemukan" });
        router.replace("/transactions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, addToast]);

  async function handleVoid() {
    if (!transaction) return;
    const reason = prompt("Alasan void:");
    if (!reason) return;

    try {
      const voided = await voidTransaction(transaction.id, reason);
      setTransaction(voided);
      addToast({ type: "success", title: "Transaksi di-void" });
    } catch {
      addToast({ type: "error", title: "Gagal void transaksi" });
    }
  }

  function handlePrintReceipt() {
    window.print();
  }

  if (loading || !transaction) {
    return (
      <PosShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PosShell>
    );
  }

  return (
    <PosShell hideNav>
      <TransactionDetail
        transaction={transaction}
        onVoid={handleVoid}
        onPrintReceipt={handlePrintReceipt}
        onBack={() => router.back()}
        voiding={voiding}
      />
    </PosShell>
  );
}
