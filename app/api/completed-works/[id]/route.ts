import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { updateCompletedWorkSchema } from '@/shared/lib/validators';

// PATCH /api/completed-works/[id] - обновить отдельную запись
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const body = await request.json();
    const validated = updateCompletedWorkSchema.parse(body);

    const existing = await prisma.completedWork.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Запись не найдена', 404);
    }

    const work = await prisma.completedWork.update({
      where: { id: numericId },
      data: {
        name: validated.name ?? existing.name,
        quantity: validated.quantity ?? existing.quantity,
        cost: validated.cost ?? existing.cost,
        category: validated.category ?? existing.category,
      },
      include: { project: true },
    });

    return successResponse(work);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return handlePrismaError(error);
  }
}

// DELETE /api/completed-works/[id] - удалить запись
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const existing = await prisma.completedWork.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Запись не найдена', 404);
    }

    await prisma.completedWork.delete({ where: { id: numericId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/completed-works/[id] error:', error);
    return handlePrismaError(error);
  }
}
