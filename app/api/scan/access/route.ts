// app/api/scan/access/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ allowed: false });
  }

  if (session.user.role === 'ADMIN') {
    return NextResponse.json({ allowed: true });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: { isStaff: true },
  });

  return NextResponse.json({ allowed: member?.isStaff === true });
}
