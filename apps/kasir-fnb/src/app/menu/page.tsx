"use client";

import { useState } from "react";
import { FnbShell } from "@/components/layout/FnbShell";
import { MenuList, MenuForm, CategoryManager, ModifierManager, useMenu } from "@/features/menu";
import type { MenuItem, MenuCategory, MenuModifier } from "@/features/menu";
import { saveMenuModifier, deleteMenuModifier } from "@/features/menu/data/queries";
import { useToast } from "@kasirsolo/ui";

export default function MenuPage() {
  const { items, categories, modifiers, loading, addItem, removeItem, addCategory, removeCategory, load } = useMenu();
  const { addToast } = useToast();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showManage, setShowManage] = useState(false);

  async function handleSaveItem(item: MenuItem) {
    await addItem(item);
    setShowForm(false);
    setEditingItem(null);
    addToast({ type: "success", title: "Menu disimpan" });
  }

  async function handleDeleteItem(item: MenuItem) {
    if (!confirm(`Hapus menu "${item.name}"?`)) return;
    await removeItem(item.id);
    addToast({ type: "success", title: "Menu dihapus" });
  }

  async function handleToggleAvailability(item: MenuItem) {
    await addItem({ ...item, is_available: !item.is_available, updated_at: new Date().toISOString() });
  }

  async function handleSaveModifier(modifier: MenuModifier) {
    await saveMenuModifier(modifier);
    await load();
    addToast({ type: "success", title: "Modifier disimpan" });
  }

  async function handleDeleteModifier(id: string) {
    await deleteMenuModifier(id);
    await load();
  }

  return (
    <FnbShell>
      <div>
        {!showManage ? (
          <>
            <div className="flex justify-end px-4 pt-3">
              <button
                onClick={() => setShowManage(true)}
                className="text-xs text-brand-primary font-medium"
                type="button"
              >
                Kelola Kategori & Modifier
              </button>
            </div>
            <MenuList
              items={items}
              categories={categories}
              loading={loading}
              onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
              onDelete={handleDeleteItem}
              onAdd={() => { setEditingItem(null); setShowForm(true); }}
              onToggleAvailability={handleToggleAvailability}
            />
          </>
        ) : (
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-heading font-bold text-gray-900">Kelola</h1>
              <button onClick={() => setShowManage(false)} className="text-sm text-brand-primary font-medium" type="button">
                Kembali ke Menu
              </button>
            </div>
            <CategoryManager categories={categories} onAdd={addCategory} onDelete={removeCategory} />
            <ModifierManager modifiers={modifiers} onSave={handleSaveModifier} onDelete={handleDeleteModifier} />
          </div>
        )}

        {showForm && (
          <MenuForm
            item={editingItem}
            categories={categories}
            onSave={handleSaveItem}
            onClose={() => { setShowForm(false); setEditingItem(null); }}
          />
        )}
      </div>
    </FnbShell>
  );
}
