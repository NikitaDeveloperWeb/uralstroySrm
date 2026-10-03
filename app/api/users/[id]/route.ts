import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateUserSchema } from '@/shared/lib/validators';
import { getAuthUser } from '@/shared/lib/auth';
import { UserRole } from '@prisma/client';

// GET /api/users/[id] - получить пользователя по ID
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return errorResponse('Не авторизован', 401);
    }

    const { id } = await context.params;
    const targetUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      return errorResponse('Пользователь не найден', 404);
    }

    return successResponse(targetUser);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/users/[id] - обновить пользователя
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return errorResponse('Доступ запрещен. Требуется роль администратора.', 403);
    }

    const { id } = await context.params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error('PATCH /api/users/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/users/[id] - удалить пользователя
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return errorResponse('Доступ запрещен. Требуется роль администратора.', 403);
    }

    const { id } = await context.params;

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return handlePrismaError(error);
  }
}
