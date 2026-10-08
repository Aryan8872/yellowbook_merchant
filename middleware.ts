import { NextRequest, NextResponse } from 'next/server';
import { UserRole, getRequiredRole, hasPermission } from '@/lib/auth/permissions';
import { decodeJWT, isTokenExpired, validateToken } from '@/lib/auth/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets, API routes, and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow public admin auth pages
    if (pathname.startsWith('/admin/auth')) {
      return NextResponse.next();
    }

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Redirect to login if no tokens
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/admin/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate token and check role
    if (accessToken) {
      const validation = validateToken(accessToken);
      
      if (!validation.valid) {
        // Token is invalid or expired, try to redirect to refresh
        if (refreshToken) {
          const refreshUrl = new URL('/api/auth/refresh', request.url);
          refreshUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(refreshUrl);
        } else {
          const loginUrl = new URL('/admin/auth/login', request.url);
          loginUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }

      // Decode token and check role
      const payload = decodeJWT(accessToken);
      const userRole = payload?.role as UserRole;

      // Check if user has ADMIN role
      if (userRole !== UserRole.ADMIN) {
        // Non-admin trying to access admin routes
        if (userRole === UserRole.MERCHANT_ADMIN || userRole === UserRole.MERCHANT_STAFF) {
          // Redirect to merchant dashboard
          return NextResponse.redirect(new URL('/merchant/dashboard', request.url));
        } else {
          // Redirect to home
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  }

  // Protect /merchant routes
  if (pathname.startsWith('/merchant')) {
    // Allow public merchant auth pages
    if (pathname.startsWith('/merchant/auth')) {
      return NextResponse.next();
    }

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Redirect to login if no tokens
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/merchant/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate token and check role
    if (accessToken) {
      const validation = validateToken(accessToken);
      
      if (!validation.valid) {
        // Token is invalid or expired, try to redirect to refresh
        if (refreshToken) {
          const refreshUrl = new URL('/api/auth/refresh', request.url);
          refreshUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(refreshUrl);
        } else {
          const loginUrl = new URL('/merchant/auth/login', request.url);
          loginUrl.searchParams.set('returnUrl', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }

      // Decode token and check role
      const payload = decodeJWT(accessToken);
      const userRole = payload?.role as UserRole;

      // Check if user has merchant role
      if (
        userRole !== UserRole.MERCHANT_ADMIN &&
        userRole !== UserRole.MERCHANT_STAFF &&
        userRole !== UserRole.ADMIN
      ) {
        // Non-merchant trying to access merchant routes
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/merchant/:path*'],
};
