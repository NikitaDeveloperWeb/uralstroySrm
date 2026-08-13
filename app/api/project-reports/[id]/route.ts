import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateProjectReportSchema } from '@/shared/lib/validators';

// GET /api/project-reports/[id] - получить отчет по проекту по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.projectReport.findUnique({
      where: { id: Number(id) },
      include: {
        project: true,
      },
    });

    if (!report) {
      return errorResponse('Отчет по проекту не найден', 404);
    }

    return successResponse(report);
  } catch (error) {
    console.error('GET /api/project-reports/[id] error:', error);
    return errorResponse('Не удалось получить отчет по проекту', 500);
  }
}

// PATCH /api/project-reports/[id] - обновить отчет по проекту
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateProjectReportSchema.parse(body);

    const report = await prisma.projectReport.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(report);
  } catch (error) {
    console.error('PATCH /api/project-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/project-reports/[id] - удалить отчет по проекту
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.projectReport.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/project-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}
