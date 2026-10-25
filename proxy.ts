import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isMemberRoute = pathname.startsWith('/profile') || pathname.startsWith('/my-events') || pathname.startsWith('/attendance') || pathname.startsWith('/members');

  if (!isAdminRoute && !isMemberRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
  });

  if (isAdminRoute) {
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (isMemberRoute) {
    if (!token || token.role !== 'MEMBER') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/my-events/:path*', '/attendance/:path*', '/members/:path*', '/member/:path*'],
};
