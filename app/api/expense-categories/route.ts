import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { z } from 'zod';

const createExpenseCategorySchema = z.object({
  name: z.string().min(1, 'Укажите название'),
});

// GET /api/expense-categories
export async function GET() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return successResponse(categories);
  } catch (error) {
    console.error('GET /api/expense-categories error:', error);
    return errorResponse('Не удалось получить категории', 500);
  }
}

// POST /api/expense-categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createExpenseCategorySchema.parse(body);

    const category = await prisma.expenseCategory.create({
      data: validated,
    });

    return successResponse(category, 201);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return errorResponse('Некорректные данные', 400, error);
    }
    console.error('POST /api/expense-categories error:', error);
    return errorResponse('Не удалось создать категорию', 500);
  }
}

// PATCH /api/expense-categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = createExpenseCategorySchema.partial().parse(body);

    const category = await prisma.expenseCategory.update({
      where: { id: Number(id) },
      data: validated,
    });

    return successResponse(category);
  } catch (error) {
    console.error('PATCH /api/expense-categories/:id error:', error);
    return errorResponse('Не удалось обновить категорию', 500);
  }
}

// DELETE /api/expense-categories/:id
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.expenseCategory.delete({
      where: { id: Number(id) },
    });

    return successResponse({ message: 'Категория удалена' });
  } catch (error) {
    console.error('DELETE /api/expense-categories/:id error:', error);
    return errorResponse('Не удалось удалить категорию', 500);
  }
}
