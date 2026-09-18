import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateSupplierSchema } from '@/shared/lib/validators';

// GET /api/suppliers/[id] - получить поставщика по ID
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
    });

    if (!supplier) {
      return errorResponse('Поставщик не найден', 404);
    }

    return successResponse(supplier);
  } catch (error) {
    console.error('GET /api/suppliers/[id] error:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/suppliers/[id] - обновить поставщика
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateSupplierSchema.parse(body);

    const supplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(supplier);
  } catch (error) {
    console.error('PATCH /api/suppliers/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/suppliers/[id] - удалить поставщика
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/suppliers/[id] error:', error);
    return handlePrismaError(error);
  }
}
