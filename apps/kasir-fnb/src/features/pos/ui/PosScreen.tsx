"use client";

import { useState, useEffect } from "react";
import { MenuSearch } from "./MenuSearch";
import { MenuGrid } from "./MenuGrid";
import { OrderTypeSelector } from "./OrderTypeSelector";
import { CartPanel } from "./CartPanel";
import { PaymentModal } from "./PaymentModal";
import { SplitBillModal } from "./SplitBillModal";
import { ReceiptPreview } from "./ReceiptPreview";
import { QuickActions } from "./QuickActions";
import { TableSelector } from "./TableSelector";
import { useCart } from "../logic/useCart";
import { usePayment, type FnbReceiptData } from "../logic/usePayment";
import { getMenuItems, getMenuCategories, type FnbMenuItem, type FnbMenuCategory } from "../data/queries";
import { getCartItemCount, type MenuItemForCart } from "../data/cart-utils";
import type { FnbPaymentMethod, SplitDetail } from "../data/types";
import { formatRupiah } from "@kasirsolo/utils";
import { openDatabase, getAll } from "@/lib/db";
import type { Table } from "@/features/tables/data/types";

export function PosScreen() {
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [receipt, setReceipt] = useState<FnbReceiptData | null>(null);

  // Menu data
  const [menuItems, setMenuItems] = useState<FnbMenuItem[]>([]);
  const [categories, setCategories] = useState<FnbMenuCategory[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cart = useCart();
  const payment = usePayment();

  // Load menu data
  useEffect(() => {
    async function load() {
      try {
        await openDatabase();
        const [items, cats, tbls] = await Promise.all([
          getMenuItems(),
          getMenuCategories(),
          getAll<Table>("tables"),
        ]);
        setMenuItems(items);
        setCategories(cats);
        setTables(tbls);
      } catch {
        // Use empty
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter menu items
  const filteredItems: MenuItemForCart[] = menuItems
    .filter((item) => {
      if (activeCategory && item.category_id !== activeCategory) return false;
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category_id: item.category_id,
      is_available: item.is_available,
    }));

  function handleMenuItemTap(item: MenuItemForCart) {
    cart.addItem(item);
  }

  function handleProceedPayment() {
    if (cart.state.items.length === 0) return;
    if (cart.state.orderType === "dine_in" && !cart.state.tableId) {
      setShowTableSelector(true);
      return;
    }
    setShowPayment(true);
  }

  async function handleCompletePayment(
    method: FnbPaymentMethod,
    amountPaid: number,
    paymentRef: string | null
  ) {
    const result = await payment.processPayment(cart.state, method, amountPaid, paymentRef);
    setReceipt(result.receipt);
    setShowPayment(false);
    setShowReceipt(true);
    cart.clearCart();
  }

  function handleTableSelect(tableId: string, tableNumber: number) {
    cart.setTable(tableId, tableNumber);
    setShowTableSelector(false);
  }

  function handleSendToKitchen() {
    // In a full implementation, this would create a kitchen order without payment
    // For now, it's a placeholder
    if (cart.state.items.length === 0) return;
    if (cart.state.orderType === "dine_in" && !cart.state.tableId) {
      setShowTableSelector(true);
      return;
    }
    // TODO: Create pending kitchen order
  }

  function handleSplitBillConfirm(splits: SplitDetail[]) {
    setShowSplitBill(false);
    // TODO: Process split payments
  }

  const itemCount = getCartItemCount(cart.state.items);

  return (
    <div className="h-full flex flex-col">
      {/* Order Type Selector */}
      <div className="px-4 pt-3 pb-2">
        <OrderTypeSelector value={cart.state.orderType} onChange={cart.setOrderType} />
      </div>

      {/* Table indicator for dine-in */}
      {cart.state.orderType === "dine_in" && (
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowTableSelector(true)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm
              ${cart.state.tableNumber
                ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                : "border-pos-border bg-white text-gray-500"}`}
            type="button"
          >
            <span>
              {cart.state.tableNumber ? `Meja ${cart.state.tableNumber}` : "Pilih Meja"}
            </span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Search + Category Filter */}
      <div className="px-4 pb-2">
        <MenuSearch
          value={searchQuery}
          onChange={setSearchQuery}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <QuickActions
          onHold={() => cart.holdCart()}
          onVoid={() => cart.clearCart()}
          onDiscount={() => cart.toggleDiscount()}
          onSendToKitchen={handleSendToKitchen}
          hasItems={cart.state.items.length > 0}
        />
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <MenuGrid items={filteredItems} loading={loading} onItemTap={handleMenuItemTap} />
      </div>

      {/* Cart Summary Bar */}
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

      {/* Modals */}
      {showTableSelector && (
        <TableSelector
          tables={tables}
          selectedTableId={cart.state.tableId}
          onSelect={handleTableSelect}
          onClose={() => setShowTableSelector(false)}
        />
      )}

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

      {showPayment && (
        <PaymentModal
          total={cart.state.total}
          onClose={() => setShowPayment(false)}
          onComplete={handleCompletePayment}
          onSplitBill={() => {
            setShowPayment(false);
            setShowSplitBill(true);
          }}
          processing={payment.processing}
        />
      )}

      {showSplitBill && (
        <SplitBillModal
          total={cart.state.total}
          items={cart.state.items}
          onClose={() => setShowSplitBill(false)}
          onConfirm={handleSplitBillConfirm}
        />
      )}

      {showReceipt && receipt && (
        <ReceiptPreview receipt={receipt} onClose={() => { setShowReceipt(false); setReceipt(null); }} />
      )}
    </div>
  );
}
