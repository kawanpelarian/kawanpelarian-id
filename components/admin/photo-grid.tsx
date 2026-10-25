// components/admin/photo-grid.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Star, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Photo } from '@/hooks/use-admin-gallery';

interface PhotoGridProps {
  photos: Photo[];
  coverPhotoUrl: string | null;
  onUpload: (files: File[]) => void;
  onDelete: (photoId: string) => void;
  onSetCover: (photoUrl: string) => void;
  isUploading: boolean;
  uploadProgress?: { done: number; total: number };
  isDeletingId?: string;
}

export function PhotoGrid({ photos, coverPhotoUrl, onUpload, onDelete, onSetCover, isUploading, uploadProgress, isDeletingId }: PhotoGridProps) {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) onUpload(files);
    e.target.value = '';
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {/* Upload tile nyatu di grid, selalu jadi tile pertama */}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
          {isUploading ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              <span className="text-center text-xs">
                {uploadProgress?.done}/{uploadProgress?.total}
              </span>
            </>
          ) : (
            <>
              <ImagePlus size={22} />
              <span className="text-center text-xs">Tambah foto</span>
            </>
          )}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} disabled={isUploading} />
        </label>

        {photos.map((photo) => {
          const isCover = photo.url === coverPhotoUrl;
          return (
            <button key={photo.id} type="button" onClick={() => setPreviewPhoto(photo)} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <Image src={photo.url} alt="Gallery" fill className="object-cover transition-transform group-hover:scale-105" />

              {isCover && (
                <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-primaryBlack px-2 py-0.5 text-[10px] text-primaryWhite dark:bg-primaryWhite dark:text-primaryBlack">
                  <Star size={9} fill="currentColor" />
                  Cover
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
            </button>
          );
        })}
      </div>

      <Dialog open={!!previewPhoto} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Preview Foto</DialogTitle>
          {previewPhoto && (
            <div className="space-y-0">
              <div className="relative aspect-video w-full bg-muted">
                <Image src={previewPhoto.url} alt="Preview" fill className="object-contain" />
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-sm text-muted-foreground">{previewPhoto.url === coverPhotoUrl ? 'Foto ini adalah cover album' : 'Belum jadi cover'}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onSetCover(previewPhoto.url)} disabled={previewPhoto.url === coverPhotoUrl}>
                    <Star size={14} />
                    Jadikan Cover
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(previewPhoto.id);
                      setPreviewPhoto(null);
                    }}
                    disabled={isDeletingId === previewPhoto.id}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
