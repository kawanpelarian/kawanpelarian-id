// components/admin/deferred-image-upload-field.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeferredImageUploadFieldProps {
  // existingUrl = gambar yang udah ke-upload sebelumnya (mode edit)
  // pendingFile = file baru yang dipilih tapi belum di-upload
  existingUrl: string | null;
  pendingFile: File | null;
  onSelectFile: (file: File | null) => void;
  onRemoveExisting: () => void;
}

export function DeferredImageUploadField({ existingUrl, pendingFile, onSelectFile, onRemoveExisting }: DeferredImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelectFile(file);
    e.target.value = '';
  };

  const displayUrl = previewUrl ?? existingUrl;

  if (displayUrl) {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
        <Image src={displayUrl} alt="Cover" fill className="object-cover" />
        {pendingFile && <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">Belum diupload</span>}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => {
            if (pendingFile) {
              onSelectFile(null);
            } else {
              onRemoveExisting();
            }
          }}
        >
          <X size={16} />
        </Button>
      </div>
    );
  }

  return (
    <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
      <ImagePlus size={24} />
      <span className="text-sm">Klik untuk pilih cover</span>
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
}
