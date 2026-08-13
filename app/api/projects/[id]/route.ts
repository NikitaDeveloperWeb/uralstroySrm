import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { updateProjectSchema } from '@/shared/lib/validators';

// Стандартные категории работ для автоматической генерации сметы
const DEFAULT_WORK_CATEGORIES = [
  { name: 'Каркасы', coefficient: 0.1 },
  { name: 'Липа', coefficient: 0.2 },
  { name: 'Сосна', coefficient: 0.5 },
  { name: 'Утеплитель', coefficient: 0.3 },
  { name: 'Стропила', coefficient: 0.4 },
];

// Функция для обновления стандартной сметы работ
async function updateDefaultWorkEstimate(projectId: number, projectCost: number) {
  const managerFee = projectCost * 0.05;
  const remaining = projectCost - managerFee;
  const workBudget = remaining * 0.05;

  const categoryCount = DEFAULT_WORK_CATEGORIES.length;

  // Удаляем старые записи стандартной сметы
  await prisma.completedWork.deleteMany({
    where: {
      projectId,
      name: {
        in: DEFAULT_WORK_CATEGORIES.map(cat => cat.name),
      },
    },
  });

  // Создаём новые записи
  const works = DEFAULT_WORK_CATEGORIES.map((cat) => ({
    projectId,
    name: cat.name,
    quantity: `${Math.round(parseFloat(String(projectCost)) * cat.coefficient * 10) / 10} м²`,
    cost: Math.round((workBudget / categoryCount) * cat.coefficient * 1000) / 1000,
  }));

  return prisma.completedWork.createMany({
    data: works,
  });
}

// GET /api/projects/[id] - получить проект по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return errorResponse('Некорректный ID проекта', 400);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    if (!project) {
      return errorResponse('Проект не найден', 404);
    }

    return successResponse(project);
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error);
    return errorResponse('Не удалось получить проект', 500);
  }
}

// PATCH /api/projects/[id] - обновить проект
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return errorResponse('Некорректный ID проекта', 400);
    }

    const body = await request.json();
    console.log('PATCH /api/projects/[id] body:', JSON.stringify(body, null, 2));
    let validated;
    try {
      validated = updateProjectSchema.parse(body);
    } catch (e: any) {
      console.error('Zod validation error:', e.errors || e.message);
      if (e.errors) {
        return errorResponse('Некорректные данные', 400, e.errors);
      }
      throw e;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: validated,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    // Если изменилась стоимость — пересчитываем смету
    if (validated.cost && validated.cost > 0) {
      await updateDefaultWorkEstimate(project.id, validated.cost);
      
      const projectWithWorks = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          brigade: true,
          unitRate: true,
          materials: true,
          completedWorks: true,
        },
      });

      return successResponse(projectWithWorks);
    }

    return successResponse(project);
  } catch (error) {
    console.error('PATCH /api/projects/[id] error:', error);
    return handlePrismaError(error);
  }
}

// DELETE /api/projects/[id] - удалить проект
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return errorResponse('Некорректный ID проекта', 400);
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return successResponse({ message: 'Проект удалён' });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return errorResponse('Не удалось удалить проект', 500);
  }
}
