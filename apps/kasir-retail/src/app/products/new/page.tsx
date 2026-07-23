"use client";

import { useRouter } from "next/navigation";
import { PosShell } from "@/components/layout/PosShell";
import { ProductForm, useProducts, useCategories } from "@/features/products";
import { useToast } from "@kasirsolo/ui";
import type { ProductFormData } from "@/features/products";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, saving } = useProducts();
  const { categories } = useCategories();
  const { addToast } = useToast();

  async function handleSubmit(data: ProductFormData) {
    try {
      await createProduct(data);
      addToast({ type: "success", title: "Produk ditambahkan" });
      router.push("/products");
    } catch {
      addToast({ type: "error", title: "Gagal menambah produk" });
    }
  }

  return (
    <PosShell>
      <div className="bg-pos-bg min-h-full">
        <div className="sticky top-0 z-10 bg-white border-b border-pos-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 text-gray-600" type="button">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-lg font-heading font-bold text-gray-900">Tambah Produk</h1>
          </div>
        </div>
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={saving}
        />
      </div>
    </PosShell>
  );
}
