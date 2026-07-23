"use client";

import { useRouter } from "next/navigation";
import { PosShell } from "@/components/layout/PosShell";
import { ProductList, useProducts, useCategories } from "@/features/products";
import { useToast } from "@kasirsolo/ui";
import type { PosProduct } from "@/lib/db";

export default function ProductsPage() {
  const router = useRouter();
  const { products, loading, deleteProduct } = useProducts();
  const { categories } = useCategories();
  const { addToast } = useToast();

  function handleEdit(product: PosProduct) {
    router.push(`/products/${product.id}`);
  }

  async function handleDelete(product: PosProduct) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      addToast({ type: "success", title: "Produk dihapus" });
    } catch {
      addToast({ type: "error", title: "Gagal menghapus produk" });
    }
  }

  return (
    <PosShell>
      <ProductList
        products={products}
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => router.push("/products/new")}
      />
    </PosShell>
  );
}
