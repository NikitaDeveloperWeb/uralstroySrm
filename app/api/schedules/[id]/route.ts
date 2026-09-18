import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const updateScheduleSchema = z.object({
  date: z.string().optional(),
  employeeId: z.number().int().optional(),
  projectId: z.number().int().optional(),
  brigadeId: z.number().int().optional(),
  workType: z.string().optional(),
  hours: z.coerce.number().optional(),
  status: z.string().optional(),
  comment: z.string().optional(),
});

// GET /api/schedules/[id]
export async function GET(
  request: Request,
  context: any
) {
  const { id } = await context.params;
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        project: true,
        brigade: true,
      },
    });

    if (!schedule) {
      return errorResponse('Смена не найдена', 404);
    }

    return successResponse(schedule);
  } catch (error) {
    console.error('GET /api/schedules/[id] error:', error);
    return errorResponse('Не удалось получить смену', 500);
  }
}

// PATCH /api/schedules/[id]
export async function PATCH(
  request: Request,
  context: any
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const validated = updateScheduleSchema.parse(body);

    const data: any = { ...validated };

    // Конвертируем дату в объект Date если она есть
    if (data.date) {
      data.date = new Date(data.date);
    }

    // Если status "Отсутствует", hours = 0
    if (data.status === 'Отсутствует') {
      data.hours = 0;
    }

    const schedule = await prisma.schedule.update({
      where: { id: Number(id) },
      data,
      include: {
        employee: true,
        project: true,
        brigade: true,
      },
    });

    return successResponse(schedule);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('PATCH /api/schedules/[id] error:', error);
    return errorResponse('Не удалось обновить смену', 500);
  }
}

// DELETE /api/schedules/[id]
export async function DELETE(
  request: Request,
  context: any
) {
  const { id } = await context.params;
  try {
    await prisma.schedule.delete({
      where: { id: Number(id) },
    });

    return successResponse({ message: 'Смена удалена' });
  } catch (error) {
    console.error('DELETE /api/schedules/[id] error:', error);
    return errorResponse('Не удалось удалить смену', 500);
  }
}
