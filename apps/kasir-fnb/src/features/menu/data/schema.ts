import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(1, "Nama menu harus diisi").max(100),
  price: z.number().min(0, "Harga minimal 0"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().max(500).nullable().optional(),
  is_available: z.boolean().default(true),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi").max(50),
  color: z.string().default("#FF5F1F"),
});

export const menuModifierSchema = z.object({
  name: z.string().min(1, "Nama modifier harus diisi"),
  options: z.array(z.object({
    label: z.string().min(1),
    price_adjustment: z.number(),
  })).min(1, "Minimal 1 pilihan"),
  is_required: z.boolean().default(false),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;
export type MenuCategoryFormData = z.infer<typeof menuCategorySchema>;
export type MenuModifierFormData = z.infer<typeof menuModifierSchema>;
