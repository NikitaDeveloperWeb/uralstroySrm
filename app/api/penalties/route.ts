import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

const penaltySchema = z.object({
  employeeId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive(),
  date: z.string().datetime().or(z.string().date()),
  reason: z.string().min(1),
});

// GET /api/penalties
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get('employeeId');

  try {
    const where: any = {};
    if (employeeId) {
      where.employeeId = parseInt(employeeId);
    }

    const penalties = await prisma.penalty.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' },
    });

    return successResponse(penalties);
  } catch (error) {
    console.error('GET /api/penalties error:', error);
    return errorResponse('Не удалось получить штрафы', 500);
  }
}

// POST /api/penalties
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = penaltySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const { employeeId, amount, date, reason } = parsed.data;

    const penalty = await prisma.penalty.create({
      data: {
        employeeId,
        amount,
        date: new Date(date),
        reason,
      },
      include: { employee: true },
    });

    return successResponse(penalty, 201);
  } catch (error) {
    console.error('POST /api/penalties error:', error);
    return errorResponse('Не удалось создать штраф', 500);
  }
}

// DELETE /api/penalties?id=...
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  try {
    if (!id) return errorResponse('ID не указан', 400);
    await prisma.penalty.delete({ where: { id: parseInt(id) } });
    return successResponse({ message: 'Штраф удалён' });
  } catch (error) {
    console.error('DELETE /api/penalties error:', error);
    return errorResponse('Не удалось удалить штраф', 500);
  }
}
