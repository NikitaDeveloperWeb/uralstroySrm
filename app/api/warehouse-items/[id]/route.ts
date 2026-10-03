import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';

// GET /api/warehouse-items/[id] - получить материал по ID
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const item = await prisma.warehouseItem.findUnique({
      where: { id: Number(id) },
    });

    if (!item) {
      return errorResponse('Материал не найден', 404);
    }

    return successResponse(item);
  } catch (error) {
    console.error('GET /api/warehouse-items/[id] error:', error);
    return errorResponse('Не удалось получить материал', 500);
  }
}

// PATCH /api/warehouse-items/[id] - обновить материал
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const item = await prisma.warehouseItem.update({
      where: { id: Number(id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.quantity !== undefined && { quantity: body.quantity }),
        ...(body.unit !== undefined && { unit: body.unit }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.lotNumber !== undefined && { lotNumber: body.lotNumber }),
        ...(body.cost !== undefined && { cost: body.cost }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.supplierId !== undefined && { supplierId: body.supplierId || null }),
        lastUpdate: new Date(),
      },
    });

    return successResponse(item);
  } catch (error) {
    console.error('PATCH /api/warehouse-items/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/warehouse-items/[id] - удалить материал
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    await prisma.warehouseItem.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/warehouse-items/[id] error:', error);
    return handlePrismaError(error);
  }
}
