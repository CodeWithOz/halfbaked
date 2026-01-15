import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect the /admin route (not /admin-login)
  if (pathname === '/admin') {
    const authCookie = request.cookies.get(COOKIE_NAME);

    if (!authCookie || authCookie.value !== 'authenticated') {
      // Redirect to login page
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to access login page, redirect to admin
  if (pathname === '/admin-login') {
    const authCookie = request.cookies.get(COOKIE_NAME);

    if (authCookie && authCookie.value === 'authenticated') {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin-login'],
};
