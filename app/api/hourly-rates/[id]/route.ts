import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const updateHourlyRateSchema = z.object({
  position: z.string().min(1).optional(),
  rate: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/hourly-rates/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const rate = await prisma.hourlyRate.findUnique({
      where: { id: Number(id) },
      include: { employees: true },
    });
    if (!rate) {
      return errorResponse('Ставка не найдена', 404);
    }
    return successResponse(rate);
  } catch (error) {
    console.error('GET /api/hourly-rates/[id] error:', error);
    return errorResponse('Не удалось получить ставку', 500);
  }
}

// PATCH /api/hourly-rates/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = updateHourlyRateSchema.parse(body);

    const rate = await prisma.hourlyRate.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(rate);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('PATCH /api/hourly-rates/[id] error:', error);
    return errorResponse('Не удалось обновить ставку', 500);
  }
}

// DELETE /api/hourly-rates/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.hourlyRate.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    return successResponse({ message: 'Ставка деактивирована' });
  } catch (error) {
    console.error('DELETE /api/hourly-rates/[id] error:', error);
    return errorResponse('Не удалось деактивировать ставку', 500);
  }
}
