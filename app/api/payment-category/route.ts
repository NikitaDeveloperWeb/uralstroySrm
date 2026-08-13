import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createPaymentCategorySchema, updatePaymentCategorySchema } from '@/shared/lib/validators';

// GET /api/payment-category - получить список категорий оплаты
export async function GET() {
  try {
    const categories = await prisma.paymentCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(categories);
  } catch (error) {
    console.error('GET /api/payment-category error:', error);
    return errorResponse('Не удалось получить категории оплаты', 500);
  }
}

// POST /api/payment-category - создать категорию оплаты
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createPaymentCategorySchema.parse(body);

    const category = await prisma.paymentCategory.create({
      data: validated,
    });

    return successResponse(category, 201);
  } catch (error) {
    console.error('POST /api/payment-category error:', error);
    return handlePrismaError(error);
  }
}
