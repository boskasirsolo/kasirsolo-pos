"use client";

import { useState } from "react";
import { ProductSearch } from "./ProductSearch";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { PaymentModal } from "./PaymentModal";
import { ReceiptPreview } from "./ReceiptPreview";
import { QuickActions } from "./QuickActions";
import { useCart } from "../logic/useCart";
import { useProductSearch } from "../logic/useProductSearch";
import { usePayment } from "../logic/usePayment";
import { formatRupiah } from "@kasirsolo/utils";
import { getCartItemCount } from "../data/cart-utils";
import type { PosProduct } from "@/lib/db";
import type { PosReceipt } from "@/lib/db";

export function PosScreen() {
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<PosReceipt | null>(null);

  const cart = useCart();
  const search = useProductSearch();
  const payment = usePayment();

  function handleProductTap(product: PosProduct) {
    cart.addItem(product);
    // Brief haptic-like feedback via visual
  }

  function handleProceedPayment() {
    if (cart.state.items.length === 0) return;
    setShowPayment(true);
  }

  async function handleCompletePayment(
    method: string,
    amountPaid: number,
    paymentRef: string | null
  ) {
    try {
      const result = await payment.processPayment(
        cart.state,
        method as "cash" | "qris" | "debit" | "credit" | "transfer" | "ewallet" | "other",
        amountPaid,
        paymentRef
      );
      setReceipt(result.receipt);
      setShowPayment(false);
      setShowReceipt(true);
      cart.clearCart();
    } catch (err) {
      // Error handled in usePayment
    }
  }

  function handleCloseReceipt() {
    setShowReceipt(false);
    setReceipt(null);
  }

  const itemCount = getCartItemCount(cart.state.items);

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <ProductSearch
          value={search.query}
          onChange={search.setQuery}
          onBarcodeDetected={search.searchByBarcode}
          onCategoryChange={search.setCategory}
          categories={search.categories}
          activeCategory={search.category}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <QuickActions
          onHold={() => cart.holdCart()}
          onVoid={() => cart.clearCart()}
          onDiscount={() => cart.toggleDiscount()}
          hasItems={cart.state.items.length > 0}
        />
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ProductGrid
          products={search.products}
          loading={search.loading}
          onProductTap={handleProductTap}
        />
      </div>

      {/* Cart Summary Bar (mobile - fixed bottom, above nav) */}
      {cart.state.items.length > 0 && !showCart && (
        <div
          className="fixed left-0 right-0 bg-white border-t border-pos-border shadow-lg z-30 px-4 py-3"
          style={{ bottom: "calc(var(--bottom-nav-height) + var(--safe-bottom))" }}
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="flex-1 flex items-center gap-3 min-w-0"
              type="button"
            >
              <div className="relative">
                <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs text-gray-500">{itemCount} item</p>
                <p className="text-base font-bold text-gray-900 truncate">
                  {formatRupiah(cart.state.total)}
                </p>
              </div>
            </button>

            <button
              onClick={handleProceedPayment}
              className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-xl
                active:scale-95 transition-transform text-sm whitespace-nowrap"
              type="button"
            >
              Bayar
            </button>
          </div>
        </div>
      )}

      {/* Cart Panel (bottom sheet) */}
      {showCart && (
        <CartPanel
          cart={cart.state}
          onClose={() => setShowCart(false)}
          onUpdateQty={cart.updateItemQty}
          onRemoveItem={cart.removeItem}
          onClearCart={cart.clearCart}
          onProceedPayment={handleProceedPayment}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          total={cart.state.total}
          onClose={() => setShowPayment(false)}
          onComplete={handleCompletePayment}
          processing={payment.processing}
        />
      )}

      {/* Receipt Preview */}
      {showReceipt && receipt && (
        <ReceiptPreview
          receipt={receipt}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}
