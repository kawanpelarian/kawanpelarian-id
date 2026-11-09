// lib/upload-payment-proof.ts
import { randomUUID } from 'crypto';
import { cloudinary } from '@/lib/cloudinary';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function validateProofFile(file: File | null): string | null {
  if (!file || typeof file === 'string') return 'Bukti transfer wajib diupload';
  if (file.size > MAX_FILE_SIZE) return 'Ukuran bukti transfer maksimal 8MB';
  if (!file.type.startsWith('image/')) return 'Bukti transfer harus berupa gambar';
  return null;
}

export async function uploadPaymentProof(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'kawan-pelarian/event-payment-proofs',
          public_id: randomUUID(),
          resource_type: 'image',
        },
        (error, uploaded) => {
          if (error || !uploaded) return reject(error);
          resolve(uploaded);
        },
      )
      .end(buffer);
  });

  return result.secure_url;
}
