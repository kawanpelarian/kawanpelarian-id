import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(3, 'Nama event minimal 3 karakter'),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda strip'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  coverImageUrl: z.string().url('URL cover tidak valid').optional().nullable(),
  eventDate: z.string().min(1, 'Tanggal wajib diisi'),
  eventTime: z.string().min(1, 'Jam wajib diisi'),
  meetingPoint: z.string().min(3, 'Meeting point wajib diisi'),
  quota: z.number().int().positive('Kuota harus lebih dari 0'),
});

export type EventInput = z.infer<typeof eventSchema>;

export const updateEventSchema = eventSchema.partial();

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
