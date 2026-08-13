import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  cost: z.coerce.number().nonnegative('Стоимость должна быть >= 0'),
  category: z.string().optional().nullable(),
});

// GET /api/project-overhead-templates - получить все шаблоны общих расходов
export async function GET() {
  try {
    const templates = await prisma.projectOverheadTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(templates);
  } catch (error) {
    console.error('GET /api/project-overhead-templates error:', error);
    return errorResponse('Не удалось получить шаблоны общих расходов', 500);
  }
}

// POST /api/project-overhead-templates - создать шаблон
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    const template = await prisma.projectOverheadTemplate.create({
      data: validated,
    });

    return successResponse(template, 201);
  } catch (error) {
    console.error('POST /api/project-overhead-templates error:', error);
    return handlePrismaError(error);
  }
}
