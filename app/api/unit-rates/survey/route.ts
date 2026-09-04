import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');

    const where: any = { isActive: true };
    if (targetType) where.targetType = targetType;

    const rates = await prisma.unitRate.findMany({
      where,
      orderBy: { category: 'asc', name: 'asc' },
    });

    return successResponse(rates);
  } catch (error) {
    console.error('GET /api/unit-rates/survey error:', error);
    return errorResponse('Не удалось получить расценки', 500);
  }
}
