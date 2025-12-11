import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Only protect the business dashboard and its sub-routes
const protectedRoutes = ['/business/dashboard'];

// Public business pages that don't require authentication
const publicBusinessPages = ['/business', '/business/auth', '/business/contact', '/business/pricing', '/business/who', '/business/functions'];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // Check if it's a public business page (exact match or auth pages)
  const isPublicBusinessPage = publicBusinessPages.some(page =>
    pathname === page || pathname.startsWith('/business/auth')
  );

  // Check if the route is protected (dashboard and sub-routes)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isPublicBusinessPage) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // No token - redirect to login
      const url = new URL('/business/auth', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      // Token is valid
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      console.error('Middleware - Błąd weryfikacji tokenu:', error);
      const url = new URL('/business/auth', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For public routes, allow the request to proceed
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
     * - images (public images)
     * - icons (public icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
}