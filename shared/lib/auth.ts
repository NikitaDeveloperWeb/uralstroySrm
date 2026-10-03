import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    return null;
  }

  try {
    const decoded = Buffer.from(session, 'base64').toString('utf-8');
    const [userIdStr, timestampStr] = decoded.split(':');
    const userId = parseInt(userIdStr, 10);
    const timestamp = parseInt(timestampStr, 10);

    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    return user || null;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export function hasRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
