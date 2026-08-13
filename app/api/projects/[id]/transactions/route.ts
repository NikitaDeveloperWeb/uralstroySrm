import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handlePrismaError } from '@/shared/lib/api-response';
import { createProjectTransactionSchema } from '@/shared/lib/validators';

// GET /api/projects/[id]/transactions - получить все транзакции проекта
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

    const transactions = await prisma.projectTransaction.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
    });

    return successResponse(transactions);
  } catch (error) {
    console.error('GET /api/projects/[id]/transactions error:', error);
    return errorResponse('Не удалось получить транзакции', 500);
  }
}

// POST /api/projects/[id]/transactions - создать новую транзакцию
export async function POST(
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
    const validation = createProjectTransactionSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Ошибка валидации';
      return errorResponse(firstError as string, 400);
    }

    const { amount, date, comment } = validation.data;

    // Проверим, есть ли уже транзакции у проекта
    const existingTransactions = await prisma.projectTransaction.findMany({
      where: { projectId },
      orderBy: { date: 'asc' },
      select: { id: true, amount: true, date: true },
    });

    // Создаем транзакцию и обновляем prepayment атомарно
    const transaction = await prisma.$transaction(async (tx) => {
      // Создаем транзакцию
      const newTransaction = await tx.projectTransaction.create({
        data: {
          projectId,
          amount,
          date: new Date(date),
          comment: comment || null,
        },
      });

      // Если это первая транзакция — обновляем prepayment на проекте
      const existingTransactions = await tx.projectTransaction.findMany({
        where: { projectId },
        orderBy: { date: 'asc' },
        take: 1,
      });

      if (existingTransactions.length === 1 && existingTransactions[0].id === newTransaction.id) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            prepayment: amount,
            prepaymentDate: new Date(date),
          },
        });
      }

      return newTransaction;
    });

    return successResponse(transaction, 201);
  } catch (error) {
    console.error('POST /api/projects/[id]/transactions error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      return errorResponse('Не удалось создать транзакцию: ' + error.message, 500);
    }
    return errorResponse('Не удалось создать транзакцию: неизвестная ошибка', 500);
  }
}
