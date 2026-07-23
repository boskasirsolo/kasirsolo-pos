"use client";

import { useState } from "react";
import type { FnbMenuCategory } from "../data/queries";

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  categories: FnbMenuCategory[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function MenuSearch({
  value,
  onChange,
  categories,
  activeCategory,
  onCategoryChange,
}: MenuSearchProps) {
  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cari menu..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-pos-border rounded-xl
            text-sm text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
            type="button"
            aria-label="Hapus pencarian"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${activeCategory === null
                ? "bg-brand-primary text-white"
                : "bg-white text-gray-600 border border-pos-border"}`}
            type="button"
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${activeCategory === cat.id
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-600 border border-pos-border"}`}
              type="button"
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
