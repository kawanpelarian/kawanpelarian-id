import { z } from 'zod';

export const quickCreateMemberSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .regex(/^[0-9+]+$/, 'Nomor HP hanya boleh berisi angka'),
});

export type QuickCreateMemberInput = z.infer<typeof quickCreateMemberSchema>;
