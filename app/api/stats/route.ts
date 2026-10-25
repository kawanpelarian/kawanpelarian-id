import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const totalMembers = await prisma.member.count();

  return NextResponse.json({ totalMembers });
}
