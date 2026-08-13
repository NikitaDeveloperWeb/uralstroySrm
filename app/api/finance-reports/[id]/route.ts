import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateFinanceReportSchema } from '@/shared/lib/validators';

// GET /api/finance-reports/[id] - получить финансовый отчет по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.financeReport.findUnique({
      where: { id: Number(id) },
      include: {
        project: true,
      },
    });

    if (!report) {
      return errorResponse('Финансовый отчет не найден', 404);
    }

    return successResponse(report);
  } catch (error) {
    console.error('GET /api/finance-reports/[id] error:', error);
    return errorResponse('Не удалось получить финансовый отчет', 500);
  }
}

// PATCH /api/finance-reports/[id] - обновить финансовый отчет
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateFinanceReportSchema.parse(body);

    const report = await prisma.financeReport.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(report);
  } catch (error) {
    console.error('PATCH /api/finance-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/finance-reports/[id] - удалить финансовый отчет
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.financeReport.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/finance-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}
