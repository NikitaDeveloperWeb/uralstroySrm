import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  cost: z.coerce.number().nonnegative('Цена должна быть >= 0'),
  category: z.string().optional().nullable(),
});

// GET /api/material-templates - получить все шаблоны материалов
export async function GET() {
  try {
    const templates = await prisma.materialTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(templates);
  } catch (error) {
    console.error('GET /api/material-templates error:', error);
    return errorResponse('Не удалось получить шаблоны материалов', 500);
  }
}

// POST /api/material-templates - создать шаблон
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    const template = await prisma.materialTemplate.create({
      data: validated,
    });

    return successResponse(template, 201);
  } catch (error) {
    console.error('POST /api/material-templates error:', error);
    return handlePrismaError(error);
  }
}


