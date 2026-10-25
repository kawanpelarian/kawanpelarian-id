import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';

interface Params {
  params: Promise<{ albumId: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { albumId } = await params;

  const album = await prisma.album.findUnique({ where: { id: albumId } });

  if (!album) {
    return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 8MB' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
    }

    // File udah dikompres + di-convert WebP di client, di sini tinggal forward ke Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `kawan-pelarian/albums/${albumId}`,
            public_id: randomUUID(),
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        )
        .end(buffer);
    });

    const photo = await prisma.photo.create({
      data: {
        albumId,
        url: uploadResult.secure_url,
      },
    });

    return NextResponse.json({ message: 'Foto berhasil diupload', photo }, { status: 201 });
  } catch (error) {
    console.error('Upload photo error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
