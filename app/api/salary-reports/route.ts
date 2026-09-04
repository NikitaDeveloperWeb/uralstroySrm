import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { createSalaryReportSchema } from '@/shared/lib/validators';

// GET /api/salary-reports
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const where: any = {};
    if (date) {
      const d = new Date(date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const reports = await prisma.salaryReport.findMany({
      where,
      include: { items: true },
      orderBy: { date: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/salary-reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось получить отчеты' },
      { status: 500 }
    );
  }
}

// POST /api/salary-reports - создать зарплатный отчет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSalaryReportSchema.parse(body);

    const report = await prisma.salaryReport.create({
      data: {
        date: validated.date,
        period: validated.period,
        totalAmount: validated.entries.reduce((sum, e) => sum + e.amount, 0),
        status: 'pending',
        items: {
          create: validated.entries.map((e) => ({
            employeeId: e.employeeId,
            employeeName: e.employeeName,
            amount: e.amount,
            period: validated.period,
          })),
        },
      },
      include: { items: true },
    });

    return successResponse(report, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/salary-reports error:', error);
    return errorResponse('Не удалось создать отчет', 500);
  }
}
