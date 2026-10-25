// app/api/admin/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  // Query sequential (bukan Promise.all), karena Neon serverless HTTP driver
  // punya limitasi untuk concurrent queries di development
  const totalMember = await prisma.member.count();
  const totalEvent = await prisma.event.count();
  const totalRegistration = await prisma.registration.count();
  const totalAttendance = await prisma.registration.count({
    where: { status: 'CHECKED_IN' },
  });
  const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
  const verifiedOrders = await prisma.order.count({ where: { status: 'VERIFIED' } });
  const rejectedOrders = await prisma.order.count({ where: { status: 'REJECTED' } });

  return NextResponse.json({
    totalMember,
    totalEvent,
    totalRegistration,
    totalAttendance,
    pendingOrders,
    verifiedOrders,
    rejectedOrders,
  });
}
