// components/admin/product-form.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useCreateProduct, useUpdateProduct, type AdminProduct } from '@/hooks/use-admin-products';
import { DeferredImageUploadField } from '@/components/admin/deferred-image-upload-field';
import { DeferredMultiImageUploadField } from '@/components/admin/deferred-multi-image-upload-field';
import { compressImage } from '@/lib/compress-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VariantForm {
  id?: string;
  size: string;
  stock: number;
}

interface ProductFormProps {
  product?: AdminProduct; // ada = mode edit, kosong = mode create
}

const emptyVariant: VariantForm = { size: '', stock: 0 };

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantForm[]>([{ ...emptyVariant }]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!product) return;

    setName(product.name);
    setDescription(product.description ?? '');
    setPrice(String(product.price));
    setExistingCoverUrl(product.imageUrl);
    setExistingImages(product.images.map((img) => img.url));
    setIsActive(product.isActive);
    setVariants(product.variants.length > 0 ? product.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })) : [{ ...emptyVariant }]);
  }, [product]);

  const handleAddVariant = () => setVariants([...variants, { ...emptyVariant }]);

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantForm, value: string | number) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nama produk wajib diisi');
      return;
    }

    const priceNumber = Number(price);
    if (!price || isNaN(priceNumber) || priceNumber < 0) {
      toast.error('Harga gak valid');
      return;
    }

    const validVariants = variants.filter((v) => v.size.trim());
    if (validVariants.length === 0) {
      toast.error('Minimal 1 varian ukuran');
      return;
    }

    setIsUploading(true);

    try {
      // Baru beneran upload ke Cloudinary di titik ini, bukan pas file
      // dipilih - biar gak ada file "nyangkut" kalau admin batal isi form
      const uploadFile = async (file: File): Promise<string> => {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressed);
        formData.append('folder', 'kawan-pelarian/products');

        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Gagal upload gambar');
        return data.url;
      };

      let finalCoverUrl = existingCoverUrl;
      if (pendingCoverFile) {
        finalCoverUrl = await uploadFile(pendingCoverFile);
      }

      const newlyUploadedImages = await Promise.all(pendingImages.map(uploadFile));
      const finalImages = [...existingImages, ...newlyUploadedImages];

      const input = {
        name,
        description: description || undefined,
        price: priceNumber,
        imageUrl: finalCoverUrl || '',
        images: finalImages,
        isActive,
        variants: validVariants.map((v) => ({
          id: v.id,
          size: v.size,
          stock: Number(v.stock) || 0,
        })),
      };

      if (isEditMode) {
        updateProduct.mutate(
          { id: product!.id, input },
          {
            onSuccess: () => {
              toast.success('Produk berhasil diperbarui');
              router.push(`/admin/products/${product!.id}`);
            },
            onError: (error) => toast.error(error.message),
          },
        );
      } else {
        createProduct.mutate(input, {
          onSuccess: (created) => {
            toast.success('Produk berhasil dibuat');
            router.push(`/admin/products/${created.id}`);
          },
          onError: (error) => toast.error(error.message),
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal upload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending || isUploading;

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        {/* Kolom Kiri: Gambar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gambar Cover</CardTitle>
            </CardHeader>
            <CardContent>
              <DeferredImageUploadField existingUrl={existingCoverUrl} pendingFile={pendingCoverFile} onSelectFile={setPendingCoverFile} onRemoveExisting={() => setExistingCoverUrl(null)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gambar Tambahan</CardTitle>
              <p className="text-xs text-muted-foreground">Buat carousel di halaman detail, bisa pilih beberapa sekaligus</p>
            </CardHeader>
            <CardContent>
              <DeferredMultiImageUploadField
                existingUrls={existingImages}
                pendingFiles={pendingImages}
                onAddFiles={(files) => setPendingImages([...pendingImages, ...files])}
                onRemoveExisting={(url) => setExistingImages(existingImages.filter((u) => u !== url))}
                onRemovePending={(index) => setPendingImages(pendingImages.filter((_, i) => i !== index))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Detail & Varian */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nama Produk</Label>
                <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jersey Lengan Pendek" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">Harga (Rp)</Label>
                <Input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Deskripsi</Label>
                <Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Bahan, detail, dll (opsional)" />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">Aktif / Ditampilkan</p>
                  <p className="text-xs text-muted-foreground">Produk gak aktif gak muncul di katalog publik</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Varian Ukuran &amp; Stok</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                <Plus size={14} />
                Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} placeholder="S / M / L / XL" className="flex-1" />
                  <Input type="number" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))} placeholder="Stok" className="w-24" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(index)} disabled={variants.length === 1}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submit nempel di alur biasa buat desktop */}
          <Button type="button" size="lg" className="hidden w-full lg:flex" onClick={handleSubmit} disabled={isPending}>
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengupload gambar...
              </>
            ) : isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isEditMode ? (
              'Simpan Perubahan'
            ) : (
              'Buat Produk'
            )}
          </Button>
        </div>
      </div>

      {/* Submit sticky di bawah layar buat mobile, biar gampang dijangkau jempol
          tanpa perlu scroll balik ke atas abis isi form panjang */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-4 lg:hidden">
        <Button type="button" size="lg" className="w-full" onClick={handleSubmit} disabled={isPending}>
          {isUploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mengupload gambar...
            </>
          ) : isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isEditMode ? (
            'Simpan Perubahan'
          ) : (
            'Buat Produk'
          )}
        </Button>
      </div>
    </div>
  );
}
