import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .regex(/^[0-9+]+$/, 'Nomor HP hanya boleh berisi angka'),
  birthDate: z.string().optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
