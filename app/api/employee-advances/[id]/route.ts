import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// PATCH /api/employee-advances/[id] - обновить подотчет
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const advanceId = parseInt(id, 10);

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('Укажите статус', 400);
    }

    const advance = await prisma.employeeAdvance.update({
      where: { id: advanceId },
      data: { status },
    });

    return successResponse(advance);
  } catch (error) {
    console.error('PATCH /api/employee-advances/[id] error:', error);
    return errorResponse('Не удалось обновить подотчет', 500);
  }
}

// DELETE /api/employee-advances/[id] - удалить подотчет
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const advanceId = parseInt(id, 10);

    await prisma.employeeAdvance.delete({
      where: { id: advanceId },
    });

    return successResponse({ message: 'Подотчет удален' });
  } catch (error) {
    console.error('DELETE /api/employee-advances/[id] error:', error);
    return errorResponse('Не удалось удалить подотчет', 500);
  }
}
