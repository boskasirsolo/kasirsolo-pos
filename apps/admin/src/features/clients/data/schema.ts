import { z } from "zod";

export const clientFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nama bisnis minimal 2 karakter")
    .max(100, "Nama bisnis maksimal 100 karakter"),
  phone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[\d+\-\s()]+$/, "Format nomor telepon tidak valid"),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  source: z.string().optional(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
  status: z.enum(["trial", "active", "expired", "locked", "suspended"]).optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
