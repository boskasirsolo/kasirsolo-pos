import { z } from 'zod';

export const trialSchema = z.object({
  nama: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  alamat: z
    .string()
    .min(5, 'Alamat minimal 5 karakter')
    .max(300, 'Alamat maksimal 300 karakter'),
  wa: z
    .string()
    .regex(/^\d{10,15}$/, 'Nomor WA harus 10-15 digit angka'),
  app: z
    .string()
    .min(1, 'Pilih aplikasi yang diinginkan'),
});

export type TrialFormData = z.infer<typeof trialSchema>;
