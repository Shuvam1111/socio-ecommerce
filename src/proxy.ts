import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const adminSession = request.cookies.get('socio-admin-session')?.value;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !adminSession) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!pathname.startsWith('/seller/dashboard')) return NextResponse.next();

  const session = request.cookies.get('socio-seller-session')?.value;

  if (!session) {
    const loginUrl = new URL('/seller/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/dashboard/:path*'],
};
