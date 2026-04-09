import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Only protect the business dashboard and its sub-routes
const protectedRoutes = ['/business/dashboard'];

// Public business pages that don't require authentication
const publicBusinessPages = ['/business', '/business/auth', '/business/contact', '/business/pricing', '/business/who', '/business/functions'];

const intlMiddleware = createMiddleware(routing);

export async function middleware(request) {
  const defaultResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  // Normalize pathname to strip the locale prefix (/pl/business => /business)
  const pathnameWithoutLocale = pathname.replace(/^\/(pl|en)/, '') || '/';

  // Check if it's a public business page (exact match or auth pages)
  const isPublicBusinessPage = publicBusinessPages.some(page =>
    pathnameWithoutLocale === page || pathnameWithoutLocale.startsWith('/business/auth')
  );

  // Check if the route is protected (dashboard and sub-routes)
  const isProtectedRoute = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (isProtectedRoute && !isPublicBusinessPage) {
    const token = request.cookies.get('token')?.value;

    const locale = pathname.match(/^\/(pl|en)/)?.[1] || 'pl';

    if (!token) {
      // No token - redirect to login
      const url = new URL(`/${locale}/business/auth`, request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      // Token is valid
      return defaultResponse;
    } catch (error) {
      // Token is invalid or expired
      console.error('Middleware - Błąd weryfikacji tokenu:', error);
      const url = new URL(`/${locale}/business/auth`, request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For public routes, allow the request to proceed with next-intl routing
  return defaultResponse;
}

export const config = {
  matcher: [
    '/',
    '/(pl|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
}