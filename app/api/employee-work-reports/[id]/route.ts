import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { updateEmployeeWorkReportSchema } from '@/shared/lib/validators';

// GET /api/employee-work-reports/[id] - получить служебную записку по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await prisma.employeeWorkReport.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        project: true,
      },
    });

    if (!report) {
      return errorResponse('Служебная записка не найдена', 404);
    }

    return successResponse(report);
  } catch (error) {
    console.error('GET /api/employee-work-reports/[id] error:', error);
    return errorResponse('Не удалось получить служебную записку', 500);
  }
}

// PATCH /api/employee-work-reports/[id] - обновить служебную записку
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateEmployeeWorkReportSchema.parse(body);

    const report = await prisma.employeeWorkReport.update({
      where: { id: Number(id) },
      data: validated,
      include: {
        employee: true,
        project: true,
      },
    });

    return successResponse(report);
  } catch (error) {
    console.error('PATCH /api/employee-work-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/employee-work-reports/[id] - удалить служебную записку
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.employeeWorkReport.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/employee-work-reports/[id] error:', error);
    return handlePrismaError(error);
  }
}
