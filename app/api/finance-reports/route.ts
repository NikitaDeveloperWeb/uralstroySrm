import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createFinanceReportSchema, updateFinanceReportSchema } from '@/shared/lib/validators';

// GET /api/finance-reports - получить список финансовых отчетов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) where.projectId = Number(projectId);

    const reports = await prisma.financeReport.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/finance-reports error:', error);
    return errorResponse('Не удалось получить финансовые отчеты', 500);
  }
}

// POST /api/finance-reports - создать финансовый отчет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createFinanceReportSchema.parse(body);

    const report = await prisma.financeReport.create({
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/finance-reports error:', error);
    return handlePrismaError(error);
  }
}
