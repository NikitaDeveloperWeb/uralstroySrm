import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';

// PATCH /api/supplier-materials/[id] - обновить поступление
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { supplierId, name, category, quantity, unit, price, amount, discount, date, comment, projectId, stage } = body;

    const qty = Number(quantity);
    const amt = amount ? Number(amount) : null;
    const prc = price ? Number(price) : null;
    const disc = discount ? Number(discount) : 0;

    if (isNaN(qty) || qty <= 0) {
      return errorResponse('Некорректное значение количества', 400);
    }

    const movement = await prisma.$transaction(async (tx) => {
      // Получаем старое поступление
      const oldMovement = await tx.warehouseMovement.findUnique({
        where: { id: Number(id) },
        select: { 
          itemId: true, 
          amount: true, 
          quantity: true,
          supplierId: true,
          projectId: true,
        },
      });

      if (!oldMovement) {
        throw new Error('Поступление не найдено');
      }

      // Обновляем движение
      const updated = await tx.warehouseMovement.update({
        where: { id: Number(id) },
        data: {
          amount: amt,
          date: date ? new Date(date) : undefined,
          comment: comment ?? undefined,
          supplierId: supplierId ?? undefined,
          projectId: projectId ?? undefined,
        },
        include: { item: true, supplier: true, project: true },
      });

      // Обновляем количество на складе
      const item = await tx.warehouseItem.update({
        where: { id: oldMovement.itemId },
        data: {
          quantity: { increment: qty - oldMovement.quantity },
          lastUpdate: new Date(),
        },
      });

      return updated;
    });

    return successResponse(movement);
  } catch (error) {
    console.error('PATCH /api/supplier-materials/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/supplier-materials/[id] - удалить поступление
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    await prisma.$transaction(async (tx) => {
      // Получаем поступление перед удалением
      const movement = await tx.warehouseMovement.findUnique({
        where: { id: Number(id) },
        select: { 
          itemId: true, 
          amount: true, 
          quantity: true,
          supplierId: true,
          projectId: true,
        },
      });

      if (!movement) {
        throw new Error('Поступление не найдено');
      }

      // Уменьшаем количество на складе
      await tx.warehouseItem.update({
        where: { id: movement.itemId },
        data: {
          quantity: { decrement: movement.quantity },
          lastUpdate: new Date(),
        },
      });

      // Удаляем движение
      await tx.warehouseMovement.delete({
        where: { id: Number(id) },
      });
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/supplier-materials/[id] error:', error);
    return handlePrismaError(error);
  }
}
