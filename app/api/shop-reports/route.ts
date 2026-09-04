import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createShopReportSchema } from '@/shared/lib/validators';

// GET /api/shop-reports - получить отчеты цеха
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (employeeId) where.employeeId = Number(employeeId);
    if (projectId) where.projectId = Number(projectId);

    const reports = await prisma.shopReport.findMany({
      where,
      include: {
        employee: true,
        project: true,
        items: {
          include: {
            workType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/shop-reports error:', error);
    return errorResponse('Не удалось получить отчеты цеха', 500);
  }
}

// POST /api/shop-reports - создать отчет цеха
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createShopReportSchema.parse(body);

    // Calculate total amount from items
    const totalAmount = validated.items.reduce((sum, item) => sum + item.amount, 0);

    const report = await prisma.shopReport.create({
      data: {
        employeeId: validated.employeeId,
        projectId: validated.projectId,
        date: validated.date,
        periodFrom: validated.periodFrom,
        periodTo: validated.periodTo,
        comment: validated.comment,
        totalAmount,
        items: {
          create: validated.items.map(item => ({
            workTypeId: item.workTypeId,
            workName: item.workName,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        },
      },
      include: {
        employee: true,
        project: true,
        items: {
          include: {
            workType: true,
          },
        },
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/shop-reports error:', error);
    return errorResponse('Не удалось создать отчет цеха', 400);
  }
}
