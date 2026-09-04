import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateWarehouseItemSchema } from '@/shared/lib/validators';

// GET /api/warehouse/[id] - получить товар по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.warehouseItem.findUnique({
      where: { id: Number(id) },
      include: {
        movements: true,
        notifications: true,
      },
    });

    if (!item) {
      return errorResponse('Товар не найден', 404);
    }

    // Маппинг статусов из БД на фронтенд
    const statusMap: Record<string, string> = {
      'достаточно': 'in-stock',
      'мало': 'in-stock',
      'критически мало': 'in-stock',
      'нет в наличии': 'in-stock',
      'ordered': 'ordered',
    };

    return successResponse({ ...item, status: statusMap[item.status] || 'in-stock' });
  } catch (error) {
    console.error('GET /api/warehouse/[id] error:', error);
    return errorResponse('Не удалось получить товар', 500);
  }
}

// PATCH /api/warehouse/[id] - обновить товар
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateWarehouseItemSchema.parse(body);

    // Маппинг статусов на значения БД
    const data: Record<string, unknown> = {};
    if (validated.name !== undefined) data.name = validated.name;
    if (validated.category !== undefined) data.category = validated.category;
    if (validated.quantity !== undefined) data.quantity = validated.quantity;
    if (validated.unit !== undefined) data.unit = validated.unit;
    if (validated.price !== undefined) data.price = validated.price;
    if (validated.lotNumber !== undefined) data.lotNumber = validated.lotNumber || null;
    if (validated.cost !== undefined) data.cost = validated.cost;
    if (validated.location !== undefined) data.location = validated.location || 'Склад';
    if (validated.status !== undefined) {
      const dbStatusMap: Record<string, string> = {
        'in-stock': 'достаточно',
        'ordered': 'ordered',
      };
      data.status = dbStatusMap[validated.status] || validated.status;
    }

    const item = await prisma.warehouseItem.update({
      where: { id: Number(id) },
      data,
      include: {
        movements: true,
        notifications: true,
      },
    });

    return successResponse(item);
  } catch (error) {
    console.error('PATCH /api/warehouse/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/warehouse/[id] - удалить товар
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.warehouseItem.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/warehouse/[id] error:', error);
    return handlePrismaError(error);
  }
}
