'use client';

import { useState, useCallback } from 'react';
import { createTransaction, get, put } from '@/lib/db';
import { getCurrentUser } from '@kasirsolo/auth';
import { cartToTransactionItems } from '../data/cart-utils';
import type { CartState } from '../data/types';
import type { PosPaymentMethod, PosReceipt, PosSettings, PosTransaction } from '@/lib/db';

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PosTransaction | null>(null);

  const processPayment = useCallback(
    async (
      cart: CartState,
      method: PosPaymentMethod,
      amountPaid: number,
      paymentRef: string | null,
    ): Promise<{ transaction: PosTransaction; receipt: PosReceipt }> => {
      setProcessing(true);
      setError(null);

      try {
        const user = await getCurrentUser();
        const settings = (await get('settings', 'settings')) as PosSettings | undefined;

        const transactionData = {
          id: crypto.randomUUID(),
          items: cartToTransactionItems(cart.items),
          subtotal: cart.subtotal,
          discount_amount: cart.discountAmount,
          discount_type: cart.discountType,
          discount_value: cart.discountValue,
          tax_amount: cart.taxAmount,
          tax_percentage: cart.taxPercentage,
          total: cart.total,
          amount_paid: amountPaid,
          change: Math.max(0, amountPaid - cart.total),
          payment_method: method,
          payment_ref: paymentRef,
          cashier_id: user?.id ?? null,
          cashier_name: user?.name ?? user?.email ?? null,
          customer_name: cart.customerName,
          customer_phone: cart.customerPhone,
          notes: cart.notes,
          is_void: false,
          void_reason: null,
        };

        const transaction = await createTransaction(transactionData);
        setLastTransaction(transaction);

        // Generate receipt
        const receipt: PosReceipt = {
          id: transaction.id,
          transaction_number: transaction.transaction_number,
          store_name: settings?.store_name || 'KASIRSOLO Retail',
          store_address: settings?.store_address || null,
          store_phone: settings?.store_phone || null,
          items: transaction.items,
          subtotal: transaction.subtotal,
          discount_label:
            cart.discountType === 'percentage'
              ? `Diskon ${cart.discountValue}%`
              : cart.discountAmount > 0
                ? 'Diskon'
                : null,
          discount_amount: transaction.discount_amount,
          tax_label: settings?.tax_enabled
            ? `${settings.tax_label} ${settings.tax_percentage}%`
            : null,
          tax_amount: transaction.tax_amount,
          total: transaction.total,
          amount_paid: transaction.amount_paid,
          change: transaction.change,
          payment_method: transaction.payment_method,
          cashier_name: transaction.cashier_name,
          customer_name: transaction.customer_name,
          footer_message: settings?.receipt_footer || 'Terima kasih atas kunjungan Anda!',
          created_at: transaction.created_at,
          format: settings?.receipt_format || 'thermal_58mm',
        };

        // Save receipt to IndexedDB
        await put('receipts', receipt);

        // Play success sound if enabled
        if (settings?.sound_enabled !== false) {
          try {
            const audio = new Audio(
              'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
            );
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {
            // Sound not available
          }
        }

        return { transaction, receipt };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Pembayaran gagal';
        setError(message);
        throw err;
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  return {
    processing,
    error,
    lastTransaction,
    processPayment,
  };
}
