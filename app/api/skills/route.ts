import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const createSkillSchema = z.object({
  name: z.string().min(1, 'Укажите название'),
  description: z.string().optional(),
});

// GET /api/skills
export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
    return successResponse(skills);
  } catch (error) {
    console.error('GET /api/skills error:', error);
    return errorResponse('Не удалось получить навыки', 500);
  }
}

// POST /api/skills
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createSkillSchema.parse(body);

    const skill = await prisma.skill.create({
      data: validated,
    });

    return successResponse(skill, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/skills error:', error);
    return errorResponse('Не удалось создать навык', 500);
  }
}

// PATCH /api/skills/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createSkillSchema.partial().parse(body);

    const skill = await prisma.skill.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(skill);
  } catch (error) {
    console.error('PATCH /api/skills/:id error:', error);
    return errorResponse('Не удалось обновить навык', 500);
  }
}

// DELETE /api/skills/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.skill.delete({
      where: { id: Number(id) },
    });

    return successResponse({ message: 'Навык удален' });
  } catch (error) {
    console.error('DELETE /api/skills/:id error:', error);
    return errorResponse('Не удалось удалить навык', 500);
  }
}
