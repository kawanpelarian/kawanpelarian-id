'use client';

import { useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';

interface GalleryUploaderProps {
  onUpload: (file: File) => Promise<unknown>;
}

export function GalleryUploader({ onUpload }: GalleryUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    setProgress({ done: 0, total: files.length });

    // Upload berurutan (bukan Promise.all) biar gak overload upload_stream Cloudinary
    // sekaligus dan progress bisa ke-track jelas
    for (const file of files) {
      try {
        await onUpload(file);
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    }

    setIsUploading(false);
    e.target.value = '';
  };

  return (
    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
      {isUploading ? (
        <>
          <Loader2 size={24} className="animate-spin" />
          <span className="text-sm">
            Mengupload {progress.done}/{progress.total}...
          </span>
        </>
      ) : (
        <>
          <ImagePlus size={24} />
          <span className="text-sm">Klik untuk upload foto (bisa pilih banyak sekaligus)</span>
        </>
      )}
      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} disabled={isUploading} />
    </label>
  );
}
