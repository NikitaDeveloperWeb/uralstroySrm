import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { createFinancialPlanSchema, updateFinancialPlanSchema } from '@/shared/lib/validators';

// GET /api/financial-plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const periodFrom = searchParams.get('periodFrom');
    const periodTo = searchParams.get('periodTo');
    const projectId = searchParams.get('projectId');

    const where: any = {};

    if (periodFrom && periodTo) {
      where.AND = [
        { periodFrom: { lte: new Date(periodTo) } },
        { periodTo: { gte: new Date(periodFrom) } },
      ];
    }

    if (projectId) {
      where.projectId = Number(projectId);
    }

    const plans = await prisma.financialPlan.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { periodFrom: 'asc' },
    });

    return successResponse(plans);
  } catch (error) {
    console.error('GET /api/financial-plans error:', error);
    return errorResponse('Не удалось получить планы', 500);
  }
}

// POST /api/financial-plans
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/financial-plans body:', body);

    const validated = createFinancialPlanSchema.parse(body);
    console.log('validated:', validated);

    const plan = await prisma.financialPlan.create({
      data: {
        projectId: validated.projectId,
        periodFrom: new Date(validated.periodFrom),
        periodTo: new Date(validated.periodTo),
        plannedAmount: validated.plannedAmount,
        comment: validated.comment || null,
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

    return successResponse(plan, 201);
  } catch (error) {
    console.error('POST /api/financial-plans error:', error);
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные: ' + JSON.stringify(error), 400);
    }
    return errorResponse('Не удалось создать план', 500);
  }
}

// PATCH /api/financial-plans?id=:id
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('ID не указан', 400);
    }

    const body = await request.json();
    const validated = updateFinancialPlanSchema.parse(body);

    const plan = await prisma.financialPlan.update({
      where: { id: Number(id) },
      data: validated,
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

    return successResponse(plan);
  } catch (error) {
    console.error('PATCH /api/financial-plans error:', error);
    return errorResponse('Не удалось обновить план', 500);
  }
}

// DELETE /api/financial-plans?id=:id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('ID не указан', 400);
    }

    await prisma.financialPlan.delete({
      where: { id: Number(id) },
    });

    return successResponse({ message: 'План удален' });
  } catch (error) {
    console.error('DELETE /api/financial-plans error:', error);
    return errorResponse('Не удалось удалить план', 500);
  }
}
