"use client";

import { formatRupiah } from "@kasirsolo/utils";
import type { MenuItemForCart } from "../data/cart-utils";

interface MenuGridProps {
  items: MenuItemForCart[];
  loading: boolean;
  onItemTap: (item: MenuItemForCart) => void;
}

export function MenuGrid({ items, loading, onItemTap }: MenuGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="menu-tile animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-100 rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <p className="text-sm font-medium">Tidak ada menu</p>
        <p className="text-xs mt-1">Tambah menu di halaman Menu</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemTap(item)}
          disabled={!item.is_available}
          className={`menu-tile ${!item.is_available ? "opacity-40 cursor-not-allowed" : ""}`}
          type="button"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover mb-1"
            />
          ) : (
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
              </svg>
            </div>
          )}

          <p className="text-[11px] font-medium text-gray-800 text-center line-clamp-2 leading-tight">
            {item.name}
          </p>

          <p className="text-[11px] font-bold text-brand-primary mt-0.5">
            {formatRupiah(item.price)}
          </p>

          {!item.is_available && (
            <span className="text-[9px] text-red-500 font-medium mt-0.5">
              Habis
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
