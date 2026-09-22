import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { updateProjectSchema } from '@/shared/lib/validators';

// PATCH /api/projects/[id] - обновить проект
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
    const validated = updateProjectSchema.parse(body);

    const existing = await prisma.project.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Проект не найден', 404);
    }

    const project = await prisma.project.update({
      where: { id: numericId },
      data: validated,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    return successResponse(project);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return handlePrismaError(error);
  }
}

// DELETE /api/projects/[id] - удалить проект
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

    const existing = await prisma.project.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Проект не найден', 404);
    }

    await prisma.project.delete({ where: { id: numericId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return handlePrismaError(error);
  }
}
