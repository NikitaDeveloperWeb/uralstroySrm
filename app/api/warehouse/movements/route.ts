import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createWarehouseMovementSchema } from '@/shared/lib/validators';
import { calculateStockStatus } from '@/shared/lib/warehouse';

// GET /api/warehouse/movements - получить список перемещений
export async function GET() {
  try {
    const movements = await prisma.warehouseMovement.findMany({
      include: {
        item: true,
        supplier: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(movements);
  } catch (error) {
    console.error('GET /api/warehouse/movements error:', error);
    return handlePrismaError(error);
  }
}

// POST /api/warehouse/movements - создать перемещение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createWarehouseMovementSchema.parse(body);

    // Update item quantity based on movement type
    const item = await prisma.warehouseItem.findUnique({
      where: { id: validated.itemId },
    });

    if (!item) {
      return errorResponse('Товар не найден', 404);
    }

    if (validated.type === 'expense' && item.quantity < validated.quantity) {
      return errorResponse(
        `Недостаточно товаров на складе. Доступно: ${item.quantity}`,
        400
      );
    }

    const newQuantity = validated.type === 'income'
      ? item.quantity + validated.quantity
      : item.quantity - validated.quantity;

    const status = calculateStockStatus(newQuantity);

    const movement = await prisma.$transaction(async (tx) => {
      const m = await tx.warehouseMovement.create({
        data: {
          itemId: validated.itemId,
          type: validated.type,
          quantity: validated.quantity,
          amount: validated.amount,
          date: validated.date,
          comment: validated.comment,
          supplierId: validated.supplierId,
        },
        include: { item: true, supplier: true },
      });

      await tx.warehouseItem.update({
        where: { id: validated.itemId },
        data: {
          quantity: newQuantity,
          lastUpdate: new Date(),
          status,
        },
      });

      return m;
    });

    return successResponse(movement, 201);
  } catch (error) {
    console.error('POST /api/warehouse/movements error:', error);
    return handlePrismaError(error);
  }
}
