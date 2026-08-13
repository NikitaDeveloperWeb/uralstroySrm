import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updatePaymentCategorySchema } from '@/shared/lib/validators';

// GET /api/payment-category/[id] - получить категорию оплаты по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.paymentCategory.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return errorResponse('Категория оплаты не найдена', 404);
    }

    return successResponse(category);
  } catch (error) {
    console.error('GET /api/payment-category/[id] error:', error);
    return errorResponse('Не удалось получить категорию оплаты', 500);
  }
}

// PATCH /api/payment-category/[id] - обновить категорию оплаты
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updatePaymentCategorySchema.parse(body);

    const category = await prisma.paymentCategory.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(category);
  } catch (error) {
    console.error('PATCH /api/payment-category/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/payment-category/[id] - удалить категорию оплаты
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.paymentCategory.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/payment-category/[id] error:', error);
    return handlePrismaError(error);
  }
}
