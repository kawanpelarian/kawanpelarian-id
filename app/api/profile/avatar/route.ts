// app/api/profile/avatar/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const publicIdOf = (memberId: string) => `kawan-pelarian/members/avatars/${memberId}`;

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const limit = rateLimit(`avatar:${session.user.id}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.success) {
    return NextResponse.json({ error: 'Terlalu sering mengganti foto, coba lagi nanti' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File harus berupa gambar' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: publicIdOf(session.user.id),
            overwrite: true,
            invalidate: true,
            resource_type: 'image',
            transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'auto' }],
          },
          (error, uploaded) => {
            if (error || !uploaded) return reject(error);
            resolve(uploaded);
          },
        )
        .end(buffer);
    });

    await prisma.member.update({
      where: { id: session.user.id },
      data: { avatarUrl: result.secure_url },
    });

    return NextResponse.json({ avatarUrl: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    await cloudinary.uploader.destroy(publicIdOf(session.user.id), { invalidate: true });
    await prisma.member.update({ where: { id: session.user.id }, data: { avatarUrl: null } });

    return NextResponse.json({ message: 'Foto dihapus' });
  } catch (error) {
    console.error('Avatar delete error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
