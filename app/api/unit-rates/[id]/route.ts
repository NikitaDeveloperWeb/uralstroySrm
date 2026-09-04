import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';

// DELETE /api/unit-rates/[id] - удалить расценку
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

    const existing = await prisma.unitRate.findUnique({ where: { id: numericId } });
    if (!existing) {
      return errorResponse('Расценка не найдена', 404);
    }

    await prisma.unitRate.delete({ where: { id: numericId } });

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('DELETE /api/unit-rates/[id] error:', error);
    return handlePrismaError(error);
  }
}
