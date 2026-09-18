import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import { updateProjectTransactionSchema } from '@/shared/lib/validators';

// PATCH /api/projects/[id]/transactions/[transactionId] - обновить транзакцию
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id, transactionId: transactionIdStr } = await context.params;
    const projectId = parseInt(id);
    const transactionId = parseInt(transactionIdStr);
    
    if (isNaN(projectId) || isNaN(transactionId)) {
      return errorResponse('Некорректный ID', 400);
    }

    const body = await request.json();
    const validation = updateProjectTransactionSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(validation.error.message, 400);
    }

    // Проверяем, что транзакция принадлежит проекту
    const existingTransaction = await prisma.projectTransaction.findFirst({
      where: { id: transactionId, projectId },
    });

    if (!existingTransaction) {
      return errorResponse('Транзакция не найдена', 404);
    }

    // Атомарное обновление транзакции и prepayment
    await prisma.$transaction(async (tx) => {
      // Обновляем транзакцию
      const updatedTransaction = await tx.projectTransaction.update({
        where: { id: transactionId },
        data: {
          ...(validation.data.amount !== undefined && { amount: validation.data.amount }),
          ...(validation.data.date !== undefined && { date: new Date(validation.data.date) }),
          ...(validation.data.comment !== undefined && { comment: validation.data.comment }),
        },
      });

      // Если обновляется первая транзакция — обновляем prepayment на проекте
      const allTransactions = await tx.projectTransaction.findMany({
        where: { projectId },
        orderBy: { date: 'asc' },
      });

      const firstTransaction = allTransactions[0];
      if (firstTransaction && firstTransaction.id === transactionId) {
        await tx.project.update({
          where: { id: projectId },
          data: {
            prepayment: firstTransaction.amount,
            prepaymentDate: firstTransaction.date,
          },
        });
      }

      return updatedTransaction;
    }).then(result => {
      return result;
    });

    // Получаем обновлённую транзакцию для ответа
    const finalTransaction = await prisma.projectTransaction.findUnique({
      where: { id: transactionId },
    });

    return successResponse(finalTransaction);
  } catch (error) {
    console.error('PATCH /api/projects/[id]/transactions/[transactionId] error:', error);
    return errorResponse('Не удалось обновить транзакцию', 500);
  }
}

// DELETE /api/projects/[id]/transactions/[transactionId] - удалить транзакцию
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id, transactionId: transactionIdStr } = await context.params;
    const projectId = parseInt(id);
    const transactionId = parseInt(transactionIdStr);
    
    if (isNaN(projectId) || isNaN(transactionId)) {
      return errorResponse('Некорректный ID', 400);
    }

    // Атомарное удаление транзакции и обновление prepayment
    await prisma.$transaction(async (tx) => {
      // Проверяем, что транзакция принадлежит проекту
      const existingTransaction = await tx.projectTransaction.findFirst({
        where: { id: transactionId, projectId },
      });

      if (!existingTransaction) {
        throw new Error('Транзакция не найдена');
      }

      // Удаляем транзакцию
      await tx.projectTransaction.delete({
        where: { id: transactionId },
      });

      // Обновляем prepayment на проекте
      const remainingTransactions = await tx.projectTransaction.findMany({
        where: { projectId },
        orderBy: { date: 'asc' },
      });

      const firstTransaction = remainingTransactions[0];
      
      if (firstTransaction) {
        // Есть хотя бы одна транзакция — обновляем prepayment
        await tx.project.update({
          where: { id: projectId },
          data: {
            prepayment: firstTransaction.amount,
            prepaymentDate: firstTransaction.date,
          },
        });
      } else {
        // Транзакций больше нет — сбрасываем prepayment
        await tx.project.update({
          where: { id: projectId },
          data: {
            prepayment: null,
            prepaymentDate: null,
          },
        });
      }
    });

    return successResponse({ message: 'Транзакция удалена' });
  } catch (error) {
    console.error('DELETE /api/projects/[id]/transactions/[transactionId] error:', error);
    if (error instanceof Error && error.message === 'Транзакция не найдена') {
      return errorResponse('Транзакция не найдена', 404);
    }
    return errorResponse('Не удалось удалить транзакцию', 500);
  }
}
