import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createEmployeeWorkReportSchema, updateEmployeeWorkReportSchema } from '@/shared/lib/validators';

// GET /api/employee-work-reports - получить спискок служебных записей сотрудников
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (employeeId) where.employeeId = Number(employeeId);
    if (projectId) where.projectId = Number(projectId);

    const reports = await prisma.employeeWorkReport.findMany({
      where,
      include: {
        employee: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/employee-work-reports error:', error);
    return errorResponse('Не удалось получить служебные записи', 500);
  }
}

// POST /api/employee-work-reports - создать служебную записку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createEmployeeWorkReportSchema.parse(body);

    const report = await prisma.employeeWorkReport.create({
      data: validated,
      include: {
        employee: true,
        project: true,
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/employee-work-reports error:', error);
    return handlePrismaError(error);
  }
}
