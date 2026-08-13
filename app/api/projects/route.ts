import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createProjectSchema, updateProjectSchema } from '@/shared/lib/validators';

// Стандартные категории работ для автоматической генерации сметы
const DEFAULT_WORK_CATEGORIES = [
  { name: 'Каркасы', coefficient: 0.1 },
  { name: 'Липа', coefficient: 0.2 },
  { name: 'Сосна', coefficient: 0.5 },
  { name: 'Утеплитель', coefficient: 0.3 },
  { name: 'Стропила', coefficient: 0.4 },
];

// GET /api/projects - получить список проектов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const brigadeId = searchParams.get('brigadeId');

    const where: any = {};
    if (status) where.status = status;
    if (brigadeId) where.brigadeId = Number(brigadeId);

    const projects = await prisma.project.findMany({
      where,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(projects);
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return errorResponse('Не удалось получить проекты', 500);
  }
}

// Функция для создания стандартной сметы работ
async function createDefaultWorkEstimate(projectId: number, projectCost: number) {
  // Логика: (стоимость проекта - 5%) * 5% = сумма на все категории работ
  // Эта сумма делится между категориями согласно коэффициенту
  const managerFee = projectCost * 0.05; // 5% менеджеру
  const remaining = projectCost - managerFee; // Остаток после вычета 5%
  const workBudget = remaining * 0.05; // 5% от остатка на работы

  // Получаем количество категорий для расчёта пропорции
  const categoryCount = DEFAULT_WORK_CATEGORIES.length;

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

// POST /api/projects - создать проект
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: validated,
      include: {
        brigade: true,
        unitRate: true,
        materials: true,
        completedWorks: true,
      },
    });

    // Автоматически создаём стандартную смету работ
    if (project.cost) {
      await createDefaultWorkEstimate(project.id, project.cost);
      
      // Перезагружаем проект с новыми работами
      const projectWithWorks = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          brigade: true,
          unitRate: true,
          materials: true,
          completedWorks: true,
        },
      });

      return successResponse(projectWithWorks, 201);
    }

    return successResponse(project, 201);
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return handlePrismaError(error);
  }
}
