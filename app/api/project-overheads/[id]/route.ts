import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1, 'Название обязательно').optional(),
  cost: z.coerce.number().nonnegative('Стоимость должна быть >= 0').optional(),
  category: z.string().optional().nullable(),
});

// PATCH /api/project-overheads/[id] - обновить расход
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const overhead = await prisma.projectOverhead.update({
      where: { id: parseInt(id) },
      data: {
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.cost !== undefined && { cost: validated.cost }),
        ...(validated.category !== undefined && { category: validated.category }),
      },
    });

    return successResponse(overhead);
  } catch (error) {
    console.error('PATCH /api/project-overheads/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/project-overheads/[id] - удалить расход
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.projectOverhead.delete({
      where: { id: parseInt(id) },
    });

    return successResponse({ message: 'Расход удалён' });
  } catch (error) {
    console.error('DELETE /api/project-overheads/[id] error:', error);
    return handlePrismaError(error);
  }
}
