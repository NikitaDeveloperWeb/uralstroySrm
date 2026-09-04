import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createHourlyRateSchema = z.object({
  position: z.string().min(1, 'Название обязательно'),
  rate: z.coerce.number().int().positive('Ставка должна быть больше 0'),
  isActive: z.boolean().optional(),
});

// GET /api/hourly-rates
export async function GET() {
  try {
    const rates = await prisma.hourlyRate.findMany({
      where: { isActive: true },
      include: {
        employees: true,
      },
      orderBy: { position: 'asc' },
    });
    return successResponse(rates);
  } catch (error) {
    console.error('GET /api/hourly-rates error:', error);
    return errorResponse('Не удалось получить ставки', 500);
  }
}

// POST /api/hourly-rates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createHourlyRateSchema.parse(body);

    const rate = await prisma.hourlyRate.create({
      data: validated,
    });

    return successResponse(rate, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/hourly-rates error:', error);
    return handlePrismaError(error);
  }
}
