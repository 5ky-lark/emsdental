import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = request.cookies.get('adminToken')?.value;
    
    if (!adminToken) {
      // No admin token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the admin token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-admin';
      const decoded = jwt.verify(adminToken, jwtSecret) as any;
      
      if (!decoded.isAdmin) {
        // Token is not for admin, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Token is valid, continue to the requested page
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      console.error('Admin token verification failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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