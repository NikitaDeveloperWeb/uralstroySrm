import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createAdvanceReportSchema } from '@/shared/lib/validators';

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

    const reports = await prisma.advanceReport.findMany({
      where,
      include: { items: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('GET /api/advance-reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось получить отчеты' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAdvanceReportSchema.parse(body);

    const report = await prisma.$transaction(async (tx) => {
      const report = await tx.advanceReport.create({
        data: {
          date: validated.date,
          totalAmount: validated.entries.reduce((sum, e) => sum + e.amount, 0),
          items: {
            create: validated.entries.map((e) => ({
              employeeId: e.employeeId,
              employeeName: e.employeeName,
              amount: e.amount,
              purpose: e.purpose,
              date: validated.date,
            })),
          },
        },
        include: { items: true },
      });

      // Create expense for each advance
      for (const entry of validated.entries) {
        await tx.expense.create({
          data: {
            date: validated.date,
            amount: entry.amount,
            recipient: entry.employeeName,
            purpose: `Аванс: ${entry.purpose || 'Выдача аванса'}`,
            category: 'Аванс',
          },
        });
      }

      return report;
    });

    return successResponse(report, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/advance-reports error:', error);
    return errorResponse('Не удалось создать отчет', 500);
  }
}
