import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createSchema = z.object({
  projectId: z.number(),
  name: z.string().min(1, 'Название обязательно'),
  cost: z.coerce.number().nonnegative('Стоимость должна быть >= 0'),
  category: z.string().optional().nullable(),
});

// GET /api/project-overheads - получить все расходы проекта
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return errorResponse('Не указан projectId', 400);
    }

    const overheads = await prisma.projectOverhead.findMany({
      where: { projectId: parseInt(projectId) },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(overheads);
  } catch (error) {
    console.error('GET /api/project-overheads error:', error);
    return errorResponse('Не удалось получить расходы', 500);
  }
}

// POST /api/project-overheads - создать расход
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const projectId = Number(body.projectId);
    if (!projectId) {
      return errorResponse('Не указан projectId', 400);
    }

    const overhead = await prisma.projectOverhead.create({
      data: {
        projectId,
        name: body.name || '',
        cost: Number(body.cost) || 0,
        category: body.category || null,
      },
    });

    return successResponse(overhead, 201);
  } catch (error) {
    console.error('POST /api/project-overheads error:', error);
    return handlePrismaError(error);
  }
}
