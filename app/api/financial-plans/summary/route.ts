import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// GET /api/financial-plans/summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const periodFrom = searchParams.get('periodFrom');
    const periodTo = searchParams.get('periodTo');

    if (!periodFrom || !periodTo) {
      return errorResponse('Необходимо указать periodFrom и periodTo', 400);
    }

    const from = new Date(periodFrom);
    const to = new Date(periodTo);

    // Получаем все планы на период
    const plans = await prisma.financialPlan.findMany({
      where: {
        AND: [
          { periodFrom: { lte: to } },
          { periodTo: { gte: from } },
        ],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Получаем все projectIds из планов
    const projectIds = plans.map((p) => p.projectId);

    // Получаем факты (транзакции) за период для этих проектов
    const transactions = projectIds.length > 0
      ? await prisma.projectTransaction.findMany({
          where: {
            projectId: { in: projectIds },
            date: {
              gte: from,
              lte: to,
            },
          },
          select: {
            projectId: true,
            amount: true,
          },
        })
      : [];

    // Группируем факты по projectId
    const actualByProject: Record<number, number> = {};
    for (const t of transactions) {
      actualByProject[t.projectId] = (actualByProject[t.projectId] || 0) + t.amount;
    }

    // Собираем данные по проектам
    const projects = plans.map((plan) => {
      const planned = plan.plannedAmount;
      const actual = actualByProject[plan.projectId] || 0;
      const progress = planned > 0 ? Math.round((actual / planned) * 100) : 0;

      return {
        planId: plan.id,
        projectId: plan.projectId,
        projectName: plan.project.name,
        projectCode: plan.project.code,
        plannedAmount: planned,
        actualAmount: actual,
        progress,
        comment: plan.comment,
      };
    });

    const totalPlanned = projects.reduce((sum, p) => sum + p.plannedAmount, 0);
    const totalActual = projects.reduce((sum, p) => sum + p.actualAmount, 0);
    const totalProgress = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

    return successResponse({
      periodFrom,
      periodTo,
      totalPlanned,
      totalActual,
      totalProgress,
      projects,
    });
  } catch (error) {
    console.error('GET /api/financial-plans/summary error:', error);
    return errorResponse('Не удалось получить сводку', 500);
  }
}
