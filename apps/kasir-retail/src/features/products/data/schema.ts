import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(100, "Nama terlalu panjang"),
  barcode: z.string().max(50, "Barcode terlalu panjang").optional().or(z.literal("")),
  category_id: z.string().optional().or(z.literal("")),
  price: z.number().min(0, "Harga tidak boleh negatif"),
  cost_price: z.number().min(0, "Harga modal tidak boleh negatif"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  min_stock: z.number().min(0, "Stok minimum tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  image: z.string().nullable().optional(),
  track_stock: z.boolean(),
  notes: z.string().max(500, "Catatan terlalu panjang").optional().or(z.literal("")),
});

export type ProductSchemaType = z.infer<typeof productSchema>;
