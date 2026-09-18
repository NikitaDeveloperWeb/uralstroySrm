import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateFundSchema } from '@/shared/lib/validators';

// GET /api/funds/[id] - получить фонд по ID
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const fund = await prisma.fund.findUnique({
      where: { id: Number(id) },
      include: {
        transactions: true,
      },
    });

    if (!fund) {
      return errorResponse('Фонд не найден', 404);
    }

    return successResponse(fund);
  } catch (error) {
    console.error('GET /api/funds/[id] error:', error);
    return errorResponse('Не удалось получить фонд', 500);
  }
}

// PATCH /api/funds/[id] - обновить фонд
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validated = updateFundSchema.parse(body);

    const fund = await prisma.fund.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        transactions: true,
      },
    });

    return successResponse(fund);
  } catch (error) {
    console.error('PATCH /api/funds/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/funds/[id] - удалить фонд
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;

    await prisma.$transaction(async (tx) => {
      // Сначала удаляем все транзакции фонда
      await tx.fundTransaction.deleteMany({
        where: { fundId: Number(id) },
      });

      // Затем удаляем сам фонд
      await tx.fund.delete({
        where: { id: Number(id) },
      });
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/funds/[id] error:', error);
    return handlePrismaError(error);
  }
}
