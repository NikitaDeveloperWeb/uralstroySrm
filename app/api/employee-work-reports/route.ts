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

    const report = await prisma.$transaction(async (tx) => {
      const createData = {
        employeeId: validated.employeeId,
        workType: validated.workType,
        quantity: validated.quantity,
        rate: validated.rate,
        amount: validated.amount,
        date: validated.date,
        comment: validated.comment,
        stage: validated.stage,
        projectId: validated.projectId ?? null,
      };

      const created = await tx.employeeWorkReport.create({
        data: createData,
        include: {
          employee: true,
          project: true,
        },
      });

      // Если указан проект — добавить в смету работ проекта (merge if exists)
      if (validated.projectId) {
        const existing = await tx.completedWork.findFirst({
          where: {
            projectId: validated.projectId,
            name: validated.workType,
            stage: validated.stage || null,
          },
        });

        if (existing) {
          // Sum quantities and costs
          const existingCost = Number(existing.cost) || 0;
          const existingQty = parseFloat(String(existing.quantity)) || 0;
          await tx.completedWork.update({
            where: { id: existing.id },
            data: {
              quantity: String(existingQty + validated.quantity),
              cost: existingCost + Math.round(validated.amount),
            },
          });
        } else {
          await tx.completedWork.create({
            data: {
              projectId: validated.projectId,
              name: validated.workType,
              quantity: String(validated.quantity),
              cost: Math.round(validated.amount),
              category: null,
              stage: validated.stage || null,
            },
          });
        }
      }

      return created;
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/employee-work-reports error:', error);
    return handlePrismaError(error);
  }
}
