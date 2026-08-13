import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createUserSchema } from '@/shared/lib/validators';

// GET /api/users - получить список пользователей
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return handlePrismaError(error);
  }
}

// POST /api/users - создать пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const user = await prisma.user.create({
      data: validated,
    });

    return successResponse(user, 201);
  } catch (error) {
    console.error('POST /api/users error:', error);
    return handlePrismaError(error);
  }
}
