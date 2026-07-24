'use client';

import { useState, useCallback } from 'react';
import { getCurrentUser } from '@kasirsolo/auth';
import { saveTransaction, saveKitchenOrder, saveReceipt, getSettings } from '../data/queries';
import type { FnbCartState, FnbPaymentMethod } from '../data/types';

export interface FnbTransactionResult {
  id: string;
  transactionNumber: string;
  receipt: FnbReceiptData;
}

export interface FnbReceiptData {
  id: string;
  transactionNumber: string;
  storeName: string;
  storeAddress: string | null;
  storePhone: string | null;
  orderType: string;
  tableNumber: number | null;
  queueNumber: number | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    modifiers: string;
    total: number;
  }>;
  subtotal: number;
  discountLabel: string | null;
  discountAmount: number;
  serviceChargeLabel: string | null;
  serviceChargeAmount: number;
  taxLabel: string | null;
  taxAmount: number;
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: string;
  cashierName: string | null;
  customerName: string | null;
  footerMessage: string;
  createdAt: string;
}

export function usePayment() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<FnbTransactionResult | null>(null);

  const processPayment = useCallback(
    async (
      cart: FnbCartState,
      method: FnbPaymentMethod,
      amountPaid: number,
      paymentRef: string | null,
    ): Promise<FnbTransactionResult> => {
      setProcessing(true);
      setError(null);

      try {
        const user = await getCurrentUser();
        const settings = await getSettings();
        const now = new Date();
        const txId = crypto.randomUUID();
        const txNumber = `FNB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

        // Generate queue number for takeaway
        let queueNumber = cart.queueNumber;
        if (cart.orderType === 'takeaway' && settings.queue_enabled && !queueNumber) {
          const dateKey = `fnb_queue_${now.toISOString().slice(0, 10)}`;
          const current = parseInt(localStorage.getItem(dateKey) || '0', 10);
          queueNumber = current + 1;
          localStorage.setItem(dateKey, String(queueNumber));
        }

        const transactionData = {
          id: txId,
          transaction_number: txNumber,
          order_type: cart.orderType,
          table_id: cart.tableId,
          table_number: cart.tableNumber,
          queue_number: queueNumber,
          items: cart.items.map((item) => ({
            menu_item_id: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            modifiers: item.modifiers,
            modifiers_total: item.modifiersTotal,
            notes: item.notes,
            discount: item.discount,
            total: item.total,
          })),
          subtotal: cart.subtotal,
          discount_type: cart.discountType,
          discount_value: cart.discountValue,
          discount_amount: cart.discountAmount,
          tax_amount: cart.taxAmount,
          tax_percentage: cart.taxPercentage,
          service_charge_amount: cart.serviceChargeAmount,
          service_charge_percentage: cart.serviceChargePercentage,
          total: cart.total,
          amount_paid: amountPaid,
          change: Math.max(0, amountPaid - cart.total),
          payment_method: method,
          payment_ref: paymentRef,
          cashier_id: user?.id ?? null,
          cashier_name: user?.name ?? user?.email ?? null,
          customer_name: cart.customerName,
          customer_phone: cart.customerPhone,
          delivery_platform: cart.deliveryPlatform,
          notes: cart.notes,
          status: 'completed',
          kitchen_status: settings.kds_enabled ? 'sent' : 'served',
          is_void: false,
          void_reason: null,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        };

        await saveTransaction(transactionData);

        // Create kitchen order if KDS enabled
        if (settings.kds_enabled) {
          const kitchenOrder = {
            id: crypto.randomUUID(),
            transaction_id: txId,
            items: cart.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              modifiers: item.modifiers.map((m) => `${m.name}: ${m.option}`).join(', '),
              notes: item.notes,
            })),
            status: 'new',
            table_number: cart.tableNumber,
            order_type: cart.orderType,
            queue_number: queueNumber,
            created_at: now.toISOString(),
            started_at: null,
            completed_at: null,
          };
          await saveKitchenOrder(kitchenOrder);
        }

        // Build receipt
        const receipt: FnbReceiptData = {
          id: txId,
          transactionNumber: txNumber,
          storeName: settings.store_name || 'KASIRSOLO F&B',
          storeAddress: settings.store_address,
          storePhone: settings.store_phone,
          orderType:
            cart.orderType === 'dine_in'
              ? 'Dine In'
              : cart.orderType === 'takeaway'
                ? 'Takeaway'
                : 'Delivery',
          tableNumber: cart.tableNumber,
          queueNumber,
          items: cart.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price + item.modifiersTotal,
            modifiers: item.modifiers.map((m) => `${m.name}: ${m.option}`).join(', '),
            total: item.total,
          })),
          subtotal: cart.subtotal,
          discountLabel:
            cart.discountType === 'percentage'
              ? `Diskon ${cart.discountValue}%`
              : cart.discountAmount > 0
                ? 'Diskon'
                : null,
          discountAmount: cart.discountAmount,
          serviceChargeLabel: cart.serviceChargeEnabled
            ? `Service Charge ${cart.serviceChargePercentage}%`
            : null,
          serviceChargeAmount: cart.serviceChargeAmount,
          taxLabel: cart.taxEnabled ? `${settings.tax_label} ${cart.taxPercentage}%` : null,
          taxAmount: cart.taxAmount,
          total: cart.total,
          amountPaid: amountPaid,
          change: Math.max(0, amountPaid - cart.total),
          paymentMethod: method,
          cashierName: user?.name ?? user?.email ?? null,
          customerName: cart.customerName,
          footerMessage: settings.receipt_footer || 'Terima kasih atas kunjungan Anda!',
          createdAt: now.toISOString(),
        };

        await saveReceipt({
          id: txId,
          transaction_id: txId,
          receipt_data: receipt,
          printed_at: null,
        });

        // Play success sound
        if (settings.sound_enabled !== false) {
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

        const result: FnbTransactionResult = { id: txId, transactionNumber: txNumber, receipt };
        setLastResult(result);
        return result;
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
    lastResult,
    processPayment,
  };
}
