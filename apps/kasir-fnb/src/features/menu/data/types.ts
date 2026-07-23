export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  image: string | null;
  modifiers: string[];
  is_available: boolean;
  sort_order: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  color: string;
}

export interface MenuModifier {
  id: string;
  name: string;
  options: MenuModifierOption[];
  is_required: boolean;
}

export interface MenuModifierOption {
  label: string;
  price_adjustment: number;
}

export const DEFAULT_CATEGORIES: Omit<MenuCategory, "id">[] = [
  { name: "Makanan", icon: null, sort_order: 1, color: "#EF4444" },
  { name: "Minuman", icon: null, sort_order: 2, color: "#3B82F6" },
  { name: "Snack", icon: null, sort_order: 3, color: "#F59E0B" },
  { name: "Dessert", icon: null, sort_order: 4, color: "#EC4899" },
  { name: "Paket", icon: null, sort_order: 5, color: "#8B5CF6" },
];
