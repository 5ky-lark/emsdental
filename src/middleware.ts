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

    try {
      // Verify the simple base64 token
      const tokenData = JSON.parse(Buffer.from(adminToken, 'base64').toString());
      
      if (!tokenData.isAdmin) {
        // Token is not for admin, redirect to login
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - tokenData.timestamp;
      if (tokenAge > 24 * 60 * 60 * 1000) {
        // Token is too old, redirect to login
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
     * Temporarily disable middleware to test API routes
     */
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};