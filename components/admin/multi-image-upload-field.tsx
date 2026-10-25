// components/admin/multi-image-upload-field.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { compressImage } from '@/lib/compress-image';

interface MultiImageUploadFieldProps {
  value: string[]; // array URL gambar tambahan
  onChange: (urls: string[]) => void;
  folder: string;
}

export function MultiImageUploadField({ value, onChange, folder }: MultiImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const compressed = await compressImage(file);

        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('folder', folder);

        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? 'Gagal upload gambar');
        uploadedUrls.push(data.url);
      }

      onChange([...value, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border">
            <Image src={url} alt="Gambar produk" fill className="object-cover" />
            <button type="button" onClick={() => handleRemove(url)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
              <X size={12} />
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <ImagePlus size={18} />
              <span className="text-[11px]">Tambah</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Gambar tambahan buat carousel di halaman detail (bisa pilih beberapa sekaligus).</p>
    </div>
  );
}
