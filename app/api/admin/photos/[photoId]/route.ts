import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';

interface Params {
  params: Promise<{ photoId: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { photoId } = await params;

  const photo = await prisma.photo.findUnique({ where: { id: photoId } });

  if (!photo) {
    return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 });
  }

  try {
    // Ekstrak public_id dari URL Cloudinary buat hapus file aslinya juga
    const publicId = photo.url
      .split('/')
      .slice(-3)
      .join('/')
      .replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId).catch((err) => {
      console.error('Gagal hapus dari Cloudinary:', err);
    });

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ message: 'Foto berhasil dihapus' });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
