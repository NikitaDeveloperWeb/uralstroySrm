import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse } from '@/shared/lib/api-response';
import { updateMaterialTemplateSchema } from '@/shared/lib/validators';

// GET /api/material-templates/[id] - получить один шаблон
export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.materialTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    return successResponse(template);
  } catch (error) {
    console.error('GET /api/material-templates/[id] error:', error);
    return errorResponse('Не удалось получить шаблон', 500);
  }
}

// PATCH /api/material-templates/[id] - обновить шаблон
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.materialTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    if (template.isSystem) {
      return errorResponse('Нельзя редактировать системный шаблон', 403);
    }

    const body = await request.json();
    const validated = updateMaterialTemplateSchema.parse(body);

    const updated = await prisma.materialTemplate.update({
      where: { id: templateId },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.quantity !== undefined && { quantity: validated.quantity }),
        ...(validated.cost !== undefined && { cost: Number(validated.cost) }),
        ...(validated.category !== undefined && { category: validated.category }),
      },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('PATCH /api/material-templates/[id] error:', error);
    return errorResponse('Не удалось обновить шаблон', 500);
  }
}

// DELETE /api/material-templates/[id] - удалить шаблон
export async function DELETE(
  _request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const template = await prisma.materialTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return errorResponse('Шаблон не найден', 404);
    }

    if (template.isSystem) {
      return errorResponse('Нельзя удалить системный шаблон', 403);
    }

    await prisma.materialTemplate.delete({
      where: { id: templateId },
    });

    return successResponse({ message: 'Шаблон удалён' });
  } catch (error) {
    console.error('DELETE /api/material-templates/[id] error:', error);
    return errorResponse('Не удалось удалить шаблон', 500);
  }
}
