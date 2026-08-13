import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  cost: z.coerce.number().nonnegative('Стоимость должна быть >= 0').optional(),
  category: z.string().optional().nullable(),
});

// GET /api/project-overhead-templates/[id] - получить один шаблон
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.projectOverheadTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    return successResponse(template);
  } catch (error) {
    console.error('GET /api/project-overhead-templates/[id] error:', error);
    return errorResponse('Не удалось получить шаблон', 500);
  }
}

// PATCH /api/project-overhead-templates/[id] - обновить шаблон
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.projectOverheadTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    if (template.isSystem) {
      return errorResponse('Нельзя редактировать системный шаблон', 403);
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const updated = await prisma.projectOverheadTemplate.update({
      where: { id: templateId },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.cost !== undefined && { cost: Number(validated.cost) }),
        ...(validated.category !== undefined && { category: validated.category }),
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('PATCH /api/project-overhead-templates/[id] error:', error);
    return errorResponse('Не удалось обновить шаблон', 500);
  }
}

// DELETE /api/project-overhead-templates/[id] - удалить шаблон
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.projectOverheadTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    if (template.isSystem) {
      return errorResponse('Нельзя удалить системный шаблон', 403);
    }

    await prisma.projectOverheadTemplate.delete({
      where: { id: templateId },
    });

    return successResponse({ message: 'Шаблон удалён' });
  } catch (error) {
    console.error('DELETE /api/project-overhead-templates/[id] error:', error);
    return errorResponse('Не удалось удалить шаблон', 500);
  }
}
