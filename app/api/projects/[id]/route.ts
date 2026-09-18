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
  context: any
) {
  try {
    const { id } = await context.params;
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
  context: any
) {
  try {
    const { id } = await context.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return errorResponse('Некорректный ID проекта', 400);
    }

    const body = await request.json();
    console.log('PATCH /api/projects/[id] body:', JSON.stringify(body, null, 2));
    
    // Remove nested relations and metadata that shouldn't be updated via PATCH
    const { brigade, unitRate, materials, completedWorks, createdAt, updatedAt: _updatedAt, id: _id, ...updateData } = body;
    
    // Convert empty strings to null for nullable fields
    if (updateData.prepaymentDate === '') updateData.prepaymentDate = null;
    if (updateData.prepayment === '') updateData.prepayment = null;
    
    // Convert date string to ISO datetime if needed
    if (updateData.deadline && typeof updateData.deadline === 'string' && !updateData.deadline.includes('T')) {
      updateData.deadline = updateData.deadline + 'T00:00:00.000Z';
    }
    
    let validated;
    try {
      validated = updateProjectSchema.parse(updateData);
    } catch (e: any) {
      console.error('Zod validation error:', e.errors || e.message);
      if (e.errors) {
        return errorResponse('Некорректные данные', 400, e.errors);
      }
      throw e;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    // Если изменилась стоимость — пересчитываем смету
    if (updateData.cost != null && updateData.cost > 0) {
      await updateDefaultWorkEstimate(project.id, updateData.cost);
      
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
  context: any
) {
  try {
    const { id } = await context.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return errorResponse('Некорректный ID проекта', 400);
    }

    // Каскадное удаление ВСЕХ связанных записей
    await prisma.$transaction(async (tx) => {
      // Сметы
      await tx.materialEstimate.deleteMany({ where: { projectId } });
      await tx.completedWork.deleteMany({ where: { projectId } });
      await tx.projectOverhead.deleteMany({ where: { projectId } });
      
      // Финансовые планы и транзакции
      await tx.financialPlan.deleteMany({ where: { projectId } });
      await tx.projectTransaction.deleteMany({ where: { projectId } });
      await tx.projectReport.deleteMany({ where: { projectId } });
      
      // Расходы и движения (устанавливаем projectId = null)
      await tx.expense.updateMany({
        where: { projectId },
        data: { projectId: null },
      });
      await tx.warehouseMovement.updateMany({
        where: { projectId },
        data: { projectId: null },
      });
      
      // Работы сотрудников (устанавливаем projectId = null)
      await tx.employeeWorkReport.updateMany({
        where: { projectId },
        data: { projectId: null },
      });
      
      // Расписания и отчёты
      await tx.schedule.deleteMany({ where: { projectId } });
      await tx.shopReport.deleteMany({ where: { projectId } });
      
      // Удалить сам проект
      await tx.project.delete({ where: { id: projectId } });
    });

    return successResponse({ message: 'Проект удалён' });
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error);
    return errorResponse('Не удалось удалить проект', 500);
  }
}
