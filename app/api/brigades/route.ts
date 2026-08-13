import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createBrigadeSchema, updateBrigadeSchema } from '@/shared/lib/validators';

// GET /api/brigades - получить список бригад
export async function GET() {
  try {
    const brigades = await prisma.brigade.findMany({
      include: {
        employees: true,
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(brigades);
  } catch (error) {
    console.error('GET /api/brigades error:', error);
    return errorResponse('Не удалось получить бригады', 500);
  }
}

// POST /api/brigades - создать бригаду
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createBrigadeSchema.parse(body);

    const brigade = await prisma.brigade.create({
      data: validated,
      include: {
        employees: true,
        projects: true,
      },
    });

    return successResponse(brigade, 201);
  } catch (error) {
    console.error('POST /api/brigades error:', error);
    return handlePrismaError(error);
  }
}
