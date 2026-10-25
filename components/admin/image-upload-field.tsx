'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { compressImage } from '@/lib/compress-image';
import { Button } from '@/components/ui/button';

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
}

export function ImageUploadField({ value, onChange, folder }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Gagal upload gambar');
      }

      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  if (value) {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
        <Image src={value} alt="Cover" fill className="object-cover" />
        <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2" onClick={() => onChange(null)}>
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
      {isUploading ? (
        <>
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">Mengupload...</span>
        </>
      ) : (
        <>
          <ImagePlus size={24} />
          <span className="text-sm">Klik untuk upload cover</span>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
    </label>
  );
}
