"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PosShell } from "@/components/layout/PosShell";
import { ProductForm, useProducts, useCategories } from "@/features/products";
import { useToast } from "@kasirsolo/ui";
import { getProductById } from "@/lib/db";
import type { PosProduct } from "@/lib/db";
import type { ProductFormData } from "@/features/products";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { updateProduct, deleteProduct, saving } = useProducts();
  const { categories } = useCategories();
  const { addToast } = useToast();
  const [product, setProduct] = useState<PosProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const p = await getProductById(id);
        setProduct(p ?? null);
      } catch {
        addToast({ type: "error", title: "Produk tidak ditemukan" });
        router.replace("/products");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, addToast]);

  async function handleSubmit(data: ProductFormData) {
    try {
      await updateProduct(id, data);
      addToast({ type: "success", title: "Produk diperbarui" });
      router.push("/products");
    } catch {
      addToast({ type: "error", title: "Gagal memperbarui produk" });
    }
  }

  async function handleDelete() {
    if (!confirm(`Hapus produk "${product?.name}"?`)) return;
    try {
      await deleteProduct(id);
      addToast({ type: "success", title: "Produk dihapus" });
      router.push("/products");
    } catch {
      addToast({ type: "error", title: "Gagal menghapus produk" });
    }
  }

  if (loading) {
    return (
      <PosShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PosShell>
    );
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
            <h1 className="text-lg font-heading font-bold text-gray-900">Edit Produk</h1>
          </div>
        </div>
        <ProductForm
          initialData={product}
          categories={categories}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onCancel={() => router.back()}
          loading={saving}
        />
      </div>
    </PosShell>
  );
}
