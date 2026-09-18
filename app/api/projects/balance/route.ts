import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export interface ProjectBalanceItem {
  id: number;
  name: string;
  area: string;
  address: string;
  cost: number;
  prepayment: number | null;
  prepaymentDate: string | null;
  status: string;
  totalTransactions: number;
  totalPlannedPayments: number;
  completionPercent: number;
}

// GET /api/projects/balance - получить баланс по проектам
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get('includeCompleted') === 'true';

    const where: any = {};
    if (!includeCompleted) {
      where.status = { not: 'завершен' }; // Исключаем завершенные проекты
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        transactions: {
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const balanceItems: ProjectBalanceItem[] = projects.map((project: any) => {
      // Сумма по договору
      const contractCost = project.cost || 0;

      // Сумма предоплаты
      const prepayment = project.prepayment || 0;

      // Плановые платежи = все транзакции кроме предоплаты
      const plannedPayments = project.transactions
        .filter((tx: any) => {
          // Фильтруем по дате предоплаты (если есть)
          if (project.prepaymentDate && tx.date) {
            const txDate = new Date(tx.date).toISOString().split('T')[0];
            const prepDate = new Date(project.prepaymentDate).toISOString().split('T')[0];
            // Если транзакция совпадает с датой предоплаты и суммой - это предоплата
            if (txDate === prepDate && tx.amount === prepayment) {
              return false;
            }
          }
          return true;
        })
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0);

      // Процент выполнения = (предоплата + плановые платежи) / стоимость * 100
      const totalReceived = prepayment + plannedPayments;
      const completionPercent = contractCost > 0
        ? Math.round((totalReceived / contractCost) * 100)
        : 0;

      return {
        id: project.id,
        name: project.name,
        area: project.area || '',
        address: project.address || '',
        cost: contractCost,
        prepayment,
        prepaymentDate: project.prepaymentDate,
        status: project.status,
        totalTransactions: project.transactions.length,
        totalPlannedPayments: plannedPayments,
        completionPercent: Math.min(completionPercent, 100), // Не больше 100%
      };
    });

    return successResponse(balanceItems);
  } catch (error) {
    console.error('GET /api/projects/balance error:', error);
    return errorResponse('Не удалось получить баланс по объектам', 500);
  }
}
