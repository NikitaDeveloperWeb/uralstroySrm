import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// POST /api/employee-advances/settle - погасить подотчет (создать расход)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advanceId, amount, purpose, category, date, supplierId, projectId } = body;

    if (!advanceId || !amount || !purpose) {
      return errorResponse('Укажите подотчет, сумму и цель расхода', 400);
    }

    const advance = await prisma.employeeAdvance.findUnique({
      where: { id: advanceId }
    });

    if (!advance) {
      return errorResponse('Подотчет не найден', 404);
    }

    const remaining = advance.amount - advance.settledAmount;
    const settleAmount = Math.min(Number(amount), remaining);

    if (settleAmount <= 0) {
      return errorResponse('Подотчет уже полностью погашен', 400);
    }

    // Создаем расход и обновляем подотчет
    const expense = await prisma.$transaction(async (tx) => {
      // Создаем расход
      const newExpense = await tx.expense.create({
        data: {
          date: date ? new Date(date) : new Date(),
          amount: settleAmount,
          purpose: purpose,
          category: category || 'Подотчет',
          recipient: advance.employeeName,
          supplierId: supplierId || null,
          projectId: projectId || null,
        }
      });

      // Обновляем подотчет
      const newSettledAmount = advance.settledAmount + settleAmount;
      const newStatus = newSettledAmount >= advance.amount ? 'settled' : 'active';

      await tx.employeeAdvance.update({
        where: { id: advanceId },
        data: {
          settledAmount: newSettledAmount,
          status: newStatus
        }
      });

      return newExpense;
    });

    return successResponse(expense, 201);
  } catch (error) {
    console.error('POST /api/employee-advances/settle error:', error);
    return errorResponse('Не удалось погасить подотчет', 500);
  }
}
