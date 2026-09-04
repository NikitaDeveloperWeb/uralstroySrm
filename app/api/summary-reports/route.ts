import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

const summaryReportSchema = z.object({
  name: z.string().min(1),
  period: z.string().min(1),
  date: z.string().datetime().or(z.string().date()),
  periodFrom: z.string().datetime().or(z.string().date()).optional(),
  periodTo: z.string().datetime().or(z.string().date()).optional(),
  totalIncome: z.number().optional().default(0),
  totalExpense: z.number().optional().default(0),
  profit: z.number().optional().default(0),
  data: z.any(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');

    const where: any = {};
    if (period) {
      where.period = period;
    }

    const reports = await prisma.summaryReport.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/summary-reports error:', error);
    return errorResponse('Не удалось получить отчеты', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = summaryReportSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { name, period, date, periodFrom, periodTo, totalIncome, totalExpense, profit, data } = parsed.data;

    const report = await prisma.summaryReport.create({
      data: {
        name,
        period,
        date: new Date(date),
        periodFrom: periodFrom ? new Date(periodFrom) : new Date(date),
        periodTo: periodTo ? new Date(periodTo) : new Date(date),
        totalIncome,
        totalExpense,
        profit,
        data: JSON.stringify(data),
      },
    });

    return successResponse(report, 201);
  } catch (error) {
    console.error('POST /api/summary-reports error:', error);
    return errorResponse('Не удалось сохранить отчет', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    if (!id || isNaN(id)) {
      return errorResponse('Некорректный ID', 400);
    }

    await prisma.summaryReport.delete({
      where: { id },
    });

    return successResponse({ message: 'Отчет удален' });
  } catch (error) {
    console.error('DELETE /api/summary-reports error:', error);
    return errorResponse('Не удалось удалить отчет', 500);
  }
}
