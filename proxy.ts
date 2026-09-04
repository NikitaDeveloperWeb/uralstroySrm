import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // Allow login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Allow API auth endpoints (login/logout)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check session cookie for everything else
  const session = request.cookies.get('session')?.value;

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!node_modules).*)'],
};
