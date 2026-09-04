import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createSubcontractorSchema, updateSubcontractorSchema } from '@/shared/lib/validators';

// GET /api/subcontractors - получить список подрядчиков
export async function GET() {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(subcontractors);
  } catch (error) {
    console.error('GET /api/subcontractors error:', error);
    return errorResponse('Не удалось получить подрядчиков', 500);
  }
}

// POST /api/subcontractors - создать подрядчика
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSubcontractorSchema.parse(body);

    const subcontractor = await prisma.subcontractor.create({
      data: validated,
      include: {
        projects: true,
      },
    });

    return successResponse(subcontractor, 201);
  } catch (error) {
    console.error('POST /api/subcontractors error:', error);
    return handlePrismaError(error);
  }
}
