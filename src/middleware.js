import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Pozwól na wszystkie requesty - autoryzacja będzie obsługiwana przez hooki
  // Middleware będzie używany tylko do podstawowych przekierowań

  console.log('🔍 Middleware (uproszczony) - Ścieżka:', pathname);
  
  // Przepuść wszystko - hooki 
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