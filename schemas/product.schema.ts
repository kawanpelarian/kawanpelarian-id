// schemas/product.schema.ts
import { z } from 'zod';

export const variantSchema = z.object({
  id: z.string().optional(), // ada kalau update variant existing
  size: z.string().min(1, 'Ukuran wajib diisi'),
  stock: z.number().int().min(0, 'Stok gak boleh negatif'),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  description: z.string().optional(),
  price: z.number().int().min(0, 'Harga gak boleh negatif'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).default([]),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, 'Minimal 1 varian ukuran'),
});

export type ProductInput = z.infer<typeof productSchema>;
