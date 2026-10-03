import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthUser } from '@/shared/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

const MANAGER_ALLOWED_PATHS = [
  '/projects',
  '/kanban',
  '/clients',
  '/documents',
  '/api/projects',
  '/api/clients',
  '/api/documents',
  '/help',
  '/api/notifications',
];

function isManagerAllowed(path: string): boolean {
  return MANAGER_ALLOWED_PATHS.some(
    (allowed) => path === allowed || path.startsWith(allowed + '/')
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  return handleAuth(request, pathname);
}

async function handleAuth(request: NextRequest, pathname: string) {
  const user = await getAuthUser();

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user.role !== 'ADMIN') {
    if (!isManagerAllowed(pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: 'Доступ запрещен.' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-User-Role', user.role);
  response.headers.set('X-User-Id', String(user.id));

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
