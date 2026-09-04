import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

const bonusSchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive(),
  date: z.string().datetime().or(z.string().date()),
  reason: z.string().min(1),
});

// GET /api/bonuses
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  try {
    const where: any = {};
    if (employeeId) {
      where.employeeId = parseInt(employeeId);
    }

    const bonuses = await prisma.bonus.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' },
    });

    return successResponse(bonuses);
  } catch (error) {
    console.error('GET /api/bonuses error:', error);
    return errorResponse('Не удалось получить премии', 500);
  }
}

// POST /api/bonuses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bonusSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { employeeId, amount, date, reason } = parsed.data;

    const bonus = await prisma.bonus.create({
      data: {
        employeeId,
        amount,
        date: new Date(date),
        reason,
      },
      include: { employee: true },
    });

    return successResponse(bonus, 201);
  } catch (error) {
    console.error('POST /api/bonuses error:', error);
    return errorResponse('Не удалось создать премию', 500);
  }
}

// DELETE /api/bonuses?id=...
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  try {
    if (!id) return errorResponse('ID не указан', 400);
    await prisma.bonus.delete({ where: { id: parseInt(id) } });
    return successResponse({ message: 'Премия удалена' });
  } catch (error) {
    console.error('DELETE /api/bonuses error:', error);
    return errorResponse('Не удалось удалить премию', 500);
  }
}
