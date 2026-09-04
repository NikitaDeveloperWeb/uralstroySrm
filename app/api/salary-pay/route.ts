import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, employeeName } = body;

    if (!itemId) {
      return errorResponse('Укажите ID записи', 400);
    }

    // Получаем запись
    const item = await prisma.salaryReportItem.findUnique({
      where: { id: itemId },
      include: { report: true },
    });

    if (!item) {
      return errorResponse('Запись не найдена', 404);
    }

    if (item.isPaid) {
      return errorResponse('Уже выплачено', 400);
    }

    // Создаем расход на выплату зарплаты
    await prisma.expense.create({
      data: {
        date: new Date(),
        amount: item.amount,
        recipient: employeeName || 'Сотрудник',
        purpose: `Зарплата за ${item.period}`,
        category: 'other',
      },
    });

    // Обновляем статус выплаты
    await prisma.salaryReportItem.update({
      where: { id: itemId },
      data: { isPaid: true },
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error('POST /api/salary-pay error:', error);
    return errorResponse('Не удалось выплатить зарплату', 500);
  }
}
