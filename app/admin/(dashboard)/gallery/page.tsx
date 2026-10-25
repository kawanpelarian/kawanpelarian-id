'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ImageIcon, Loader2, FolderUp } from 'lucide-react';
import { useAdminEvents } from '@/hooks/use-admin-events';
import { useAlbum, useSaveAlbum, useUploadPhoto, useDeletePhoto, useSetCoverPhoto } from '@/hooks/use-admin-gallery';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoGrid } from '@/components/admin/photo-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminGalleryPage() {
  const { data: events } = useAdminEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [isUploading, setIsUploading] = useState(false);

  const { data: album, isLoading } = useAlbum(selectedEventId);
  const saveAlbum = useSaveAlbum(selectedEventId);
  const uploadPhoto = useUploadPhoto(album?.id ?? '', selectedEventId);
  const deletePhoto = useDeletePhoto(selectedEventId);
  const setCoverPhoto = useSetCoverPhoto(album?.id ?? '', selectedEventId);

  useEffect(() => {
    setAlbumName(album?.name ?? '');
    setDriveLink(album?.driveLink ?? '');
  }, [album]);

  const handleSaveAlbumName = () => {
    if (!albumName.trim()) {
      toast.error('Nama album gak boleh kosong');
      return;
    }

    saveAlbum.mutate(
      { name: albumName, driveLink },
      {
        onSuccess: () => toast.success('Album berhasil disimpan'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleUpload = async (files: File[]) => {
    if (!album?.id) {
      toast.error('Simpan nama album dulu sebelum upload foto');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    for (const file of files) {
      try {
        await uploadPhoto.mutateAsync(file);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Gagal upload ${file.name}`);
      } finally {
        setUploadProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      }
    }

    setIsUploading(false);
    toast.success('Upload selesai');
  };

  const handleDelete = (photoId: string) => {
    deletePhoto.mutate(photoId, {
      onSuccess: () => toast.success('Foto berhasil dihapus'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleSetCover = (photoUrl: string) => {
    setCoverPhoto.mutate(photoUrl, {
      onSuccess: () => toast.success('Cover album diperbarui'),
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Galeri</h1>
        <p className="text-[15px] text-muted-foreground">Kelola dokumentasi foto tiap event</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pilih Event</CardTitle>
        </CardHeader>
        <CardContent>
          <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="flex h-9 w-full max-w-md rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
            <option value="">-- Pilih event --</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {!selectedEventId && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <ImageIcon size={28} />
          <p className="text-sm">Pilih event dulu buat mulai kelola galerinya</p>
        </div>
      )}

      {selectedEventId && isLoading && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-9 w-full max-w-md" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedEventId && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nama Album</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex max-w-md gap-2">
              <Input value={albumName} onChange={(e) => setAlbumName(e.target.value)} placeholder="Kawan Pelarian: Pelan-Pelan Lari Vol#2" />
              <Button type="button" onClick={handleSaveAlbumName} disabled={saveAlbum.isPending}>
                {saveAlbum.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}
              </Button>
            </div>

            <div className="max-w-md space-y-2">
              <Label htmlFor="driveLink" className="flex items-center gap-1.5">
                <FolderUp size={14} />
                Link Google Drive (opsional)
              </Label>
              <Input id="driveLink" value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." />
              <p className="text-xs text-muted-foreground">Buat foto lengkap yang gak semuanya di-upload ke sini, taruh link folder Drive-nya di sini biar member bisa lihat semua.</p>
            </div>

            {album?.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Foto ({album.photos.length})</Label>
                </div>
                <PhotoGrid
                  photos={album.photos}
                  coverPhotoUrl={album.coverPhotoUrl}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  onSetCover={handleSetCover}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  isDeletingId={deletePhoto.isPending ? deletePhoto.variables : undefined}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Simpan nama album dulu sebelum bisa upload foto.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
