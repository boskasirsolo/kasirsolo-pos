import type { PosProduct } from "@/lib/db";

export interface ProductFormData {
  name: string;
  barcode: string;
  category_id: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  image: string | null;
  track_stock: boolean;
  notes: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormData = {
  name: "",
  barcode: "",
  category_id: "",
  price: 0,
  cost_price: 0,
  stock: 0,
  min_stock: 5,
  unit: "pcs",
  image: null,
  track_stock: true,
  notes: "",
};

export const UNITS = ["pcs", "kg", "gram", "liter", "ml", "pack", "box", "lusin", "rim", "set"];
