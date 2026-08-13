import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { createFundTransactionSchema } from '@/shared/lib/validators';

// GET /api/funds/transactions - получить список транзакций фондов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundId = searchParams.get('fundId');

    const where: any = {};
    if (fundId) where.fundId = Number(fundId);

    const transactions = await prisma.fundTransaction.findMany({
      where,
      include: {
        fund: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(transactions);
  } catch (error) {
    console.error('GET /api/funds/transactions error:', error);
    return errorResponse('Не удалось получить транзакции', 500);
  }
}

// POST /api/funds/transactions - создать транзакцию фонда
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createFundTransactionSchema.parse(body);

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.fundTransaction.create({
        data: {
          fundId: validated.fundId,
          amount: validated.amount,
          type: validated.type,
          description: validated.description,
          date: validated.date,
        },
        include: { fund: true },
      });

      // Update fund balance
      const balanceChange = validated.type === 'income'
        ? validated.amount
        : -validated.amount;

      await tx.fund.update({
        where: { id: validated.fundId },
        data: {
          balance: { increment: balanceChange },
        },
      });

      return t;
    });

    return successResponse(transaction, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/funds/transactions error:', error);
    return errorResponse('Не удалось создать транзакцию', 500);
  }
}
