import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, handlePrismaError, successResponse } from '@/shared/lib/api-response';
import { updateMaterialEstimateSchema } from '@/shared/lib/validators';

// PATCH /api/material-estimates/[id] - обновить отдельную запись
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
    console.log('PATCH body:', JSON.stringify(body));

    let validated;
    try {
      validated = updateMaterialEstimateSchema.parse(body);
      console.log('PATCH validated:', JSON.stringify(validated));
    } catch (validationError) {
      console.error('PATCH validation error:', validationError);
      if (validationError instanceof Error) {
        return errorResponse(validationError.message, 400);
      }
      return errorResponse('Ошибка валидации', 400);
    }

    const existing = await prisma.materialEstimate.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Запись не найдена', 404);
    }

    const estimate = await prisma.materialEstimate.update({
      where: { id: numericId },
      data: {
        name: validated.name ?? existing.name,
        quantity: validated.quantity ?? existing.quantity,
        cost: validated.cost ?? existing.cost,
        category: validated.category ?? existing.category,
      },
      include: { project: true },
    });

    return successResponse(estimate);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return handlePrismaError(error);
  }
}

// DELETE /api/material-estimates/[id] - удалить запись
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

    const existing = await prisma.materialEstimate.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Запись не найдена', 404);
    }

    await prisma.materialEstimate.delete({ where: { id: numericId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/material-estimates/[id] error:', error);
    return handlePrismaError(error);
  }
}
