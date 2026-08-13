import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError, deletedResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

// GET /api/unit-rates/[id] - получить расценку по ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rate = await prisma.unitRate.findUnique({
      where: { id: Number(id) },
    });

    if (!rate) {
      return errorResponse('Расценка не найдена', 404);
    }

    return successResponse(rate);
  } catch (error) {
    console.error('GET /api/unit-rates/[id] error:', error);
    return errorResponse('Не удалось получить расценку', 500);
  }
}

// PATCH /api/unit-rates/[id] - обновить расценку
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateUnitRateSchema.parse(body);

    const rate = await prisma.unitRate.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(rate);
  } catch (error) {
    console.error('PATCH /api/unit-rates/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/unit-rates/[id] - удалить расценку
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.unitRate.delete({
      where: { id: Number(id) },
    });

    return deletedResponse();
  } catch (error) {
    console.error('DELETE /api/unit-rates/[id] error:', error);
    return handlePrismaError(error);
  }
}

const createUnitRateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  unit: z.string().min(1, 'Единица измерения обязательна').default('м²'),
  pricePerUnit: z.coerce.number().positive('Цена должна быть больше 0'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateUnitRateSchema = createUnitRateSchema.partial();
