import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createUnitRateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  unit: z.string().min(1, 'Единица измерения обязательна').default('м²'),
  pricePerUnit: z.coerce.number().positive('Цена должна быть больше 0'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateUnitRateSchema = createUnitRateSchema.partial();

// GET /api/unit-rates - получить список расценок
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== null) where.isActive = isActive === 'true';

    const rates = await prisma.unitRate.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return successResponse(rates);
  } catch (error) {
    console.error('GET /api/unit-rates error:', error);
    return errorResponse('Не удалось получить расценки', 500);
  }
}

// POST /api/unit-rates - создать расценку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUnitRateSchema.parse(body);

    const rate = await prisma.unitRate.create({
      data: validated,
    });

    return successResponse(rate, 201);
  } catch (error) {
    console.error('POST /api/unit-rates error:', error);
    return handlePrismaError(error);
  }
}
