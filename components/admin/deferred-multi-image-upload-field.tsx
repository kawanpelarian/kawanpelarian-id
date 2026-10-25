// components/admin/deferred-multi-image-upload-field.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';

interface DeferredMultiImageUploadFieldProps {
  existingUrls: string[]; // gambar yang udah ke-upload sebelumnya (mode edit)
  pendingFiles: File[]; // file baru yang dipilih, belum di-upload
  onAddFiles: (files: File[]) => void;
  onRemoveExisting: (url: string) => void;
  onRemovePending: (index: number) => void;
}

function PendingThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) return null;

  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
      <Image src={previewUrl} alt="Gambar baru" fill className="object-cover" />
      <span className="absolute left-1 top-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">Baru</span>
      <button type="button" onClick={onRemove} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
        <X size={12} />
      </button>
    </div>
  );
}

export function DeferredMultiImageUploadField({ existingUrls, pendingFiles, onAddFiles, onRemoveExisting, onRemovePending }: DeferredMultiImageUploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    onAddFiles(files);
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {existingUrls.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border">
            <Image src={url} alt="Gambar produk" fill className="object-cover" />
            <button type="button" onClick={() => onRemoveExisting(url)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
              <X size={12} />
            </button>
          </div>
        ))}

        {pendingFiles.map((file, index) => (
          <PendingThumb key={index} file={file} onRemove={() => onRemovePending(index)} />
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
          <ImagePlus size={18} />
          <span className="text-[11px]">Tambah</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">Gambar tambahan buat carousel di halaman detail. File baru diupload otomatis pas kamu simpan produk.</p>
    </div>
  );
}
