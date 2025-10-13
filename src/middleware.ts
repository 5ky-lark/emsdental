import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for admin routes (but not API routes or login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !pathname.startsWith('/api/')) {
    const adminToken = request.cookies.get('adminToken')?.value;
    
    if (!adminToken) {
      // No admin token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // For now, just check if token exists (we'll do proper verification in the API)
    // This prevents the middleware from causing 502 errors
    return NextResponse.next();
  }

  // For non-admin routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};