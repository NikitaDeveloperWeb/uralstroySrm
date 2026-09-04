import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// GET /api/transactions-summary?date=2026-01-15 OR ?startDate=...&endDate=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {};

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: d, lte: end };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else {
      return errorResponse('Укажите дату или период', 400);
    }

    const transactions = await prisma.projectTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const groupedMap = transactions.reduce((acc, t) => {
      if (!acc[t.projectId]) {
        acc[t.projectId] = {
          projectId: t.projectId,
          transactions: [],
          total: 0,
        };
      }
      acc[t.projectId].transactions.push(t);
      acc[t.projectId].total += t.amount;
      return acc;
    }, {} as Record<number, { projectId: number; transactions: typeof transactions; total: number }>);

    const grouped = Object.values(groupedMap);

    return successResponse({
      transactions: grouped.map((g) => ({
        projectId: g.projectId,
        transactions: g.transactions,
        total: g.total,
      })),
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    });
  } catch (error) {
    console.error('GET /api/transactions-summary error:', error);
    return errorResponse('Не удалось получить данные', 500);
  }
}
