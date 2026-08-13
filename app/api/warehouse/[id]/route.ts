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

    return successResponse(item);
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

    const item = await prisma.warehouseItem.update({
      where: { id: Number(id) },
      data: validated,
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
