import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createProjectReportSchema, updateProjectReportSchema } from '@/shared/lib/validators';

// GET /api/project-reports - получить список отчетов по проектам
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) where.projectId = Number(projectId);

    const reports = await prisma.projectReport.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/project-reports error:', error);
    return errorResponse('Не удалось получить отчеты по проектам', 500);
  }
}

// POST /api/project-reports - создать отчет по проекту
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectReportSchema.parse(body);

    const report = await prisma.projectReport.create({
      data: validated,
      include: {
        project: true,
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/project-reports error:', error);
    return handlePrismaError(error);
  }
}
