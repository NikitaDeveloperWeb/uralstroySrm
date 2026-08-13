import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createFundSchema, updateFundSchema } from '@/shared/lib/validators';

// GET /api/funds - получить список фондов
export async function GET() {
  try {
    const funds = await prisma.fund.findMany({
      include: {
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(funds);
  } catch (error) {
    console.error('GET /api/funds error:', error);
    return errorResponse('Не удалось получить фонды', 500);
  }
}

// POST /api/funds - создать фонд
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createFundSchema.parse(body);

    const fund = await prisma.fund.create({
      data: validated,
      include: {
        transactions: true,
      },
    });

    return successResponse(fund, 201);
  } catch (error) {
    console.error('POST /api/funds error:', error);
    return handlePrismaError(error);
  }
}
