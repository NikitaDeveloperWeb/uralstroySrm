import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  quantity: z.string().min(1, 'Количество обязательно'),
  clientCost: z.coerce.number().nonnegative('Цена для клиента должна быть >= 0'),
  employeeCost: z.coerce.number().nonnegative('Цена для сотрудника должна быть >= 0'),
  category: z.string().optional().nullable(),
});

// GET /api/work-templates - получить шаблоны из UnitRate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const targetType = searchParams.get('targetType');

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (targetType) where.targetType = targetType;

    const rates = await prisma.unitRate.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        pricePerUnit: true,
        targetType: true,
      },
      orderBy: { name: 'asc' },
    });

    const templates = rates.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      quantity: '1 м²',
      cost: r.pricePerUnit,
      isSystem: false,
      targetType: r.targetType,
    }));

    return successResponse(templates);
  } catch (error) {
    console.error('GET /api/work-templates error:', error);
    return errorResponse('Не удалось получить шаблоны работ', 500);
  }
}

// POST /api/work-templates - создать расценку для клиента и сотрудника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    // Создаём для клиента
    await prisma.unitRate.create({
      data: {
        name: validated.name,
        category: validated.category || 'Прочее',
        unit: 'м²',
        pricePerUnit: validated.clientCost,
        targetType: 'client',
        isActive: true,
      },
    });

    // Создаём для сотрудника
    await prisma.unitRate.create({
      data: {
        name: validated.name,
        category: validated.category || 'Прочее',
        unit: 'м²',
        pricePerUnit: validated.employeeCost,
        targetType: 'employee',
        isActive: true,
      },
    });

    return successResponse({ message: 'Расценки созданы' }, 201);
  } catch (error) {
    console.error('POST /api/work-templates error:', error);
    return handlePrismaError(error);
  }
}
