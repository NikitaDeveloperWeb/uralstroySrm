import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const createScheduleSchema = z.object({
  date: z.string().min(1, 'Укажите дату'),
  employeeId: z.number().int(),
  projectId: z.number().int().optional(),
  brigadeId: z.number().int().optional(),
  workType: z.string().optional(),
  hours: z.coerce.number().default(8),
  status: z.string().default('план'),
  comment: z.string().optional(),
});

// GET /api/schedules?year=2026&month=7
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year')) || new Date().getFullYear();
    const month = Number(searchParams.get('month')) || new Date().getMonth();

    const fromDate = new Date(year, month, 1);
    const toDate = new Date(year, month + 1, 0, 23, 59, 59);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      orderBy: { date: 'asc' },
      include: {
        employee: true,
        project: true,
        brigade: true,
      },
    });

    return successResponse(schedules);
  } catch (error) {
    console.error('GET /api/schedules error:', error);
    return errorResponse('Не удалось получить расписание', 500);
  }
}

// POST /api/schedules
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createScheduleSchema.parse(body);

    let data: any = {
      ...validated,
      date: new Date(validated.date),
    };

    // Если status установлен в "Отсутствует", hours можно не указывать
    if (validated.status === 'Отсутствует') {
      data.hours = 0;
    }

    const schedule = await prisma.schedule.create({
      data,
      include: {
        employee: true,
        project: true,
        brigade: true,
      },
    });

    return successResponse(schedule, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/schedules error:', error);
    return errorResponse('Не удалось создать смену', 500);
  }
}
