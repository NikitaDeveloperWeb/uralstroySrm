import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Найдем все expense транзакции фондов
    const fundTransactions = await prisma.fundTransaction.findMany({
      where: {
        type: 'expense'
      },
      include: {
        fund: true
      }
    });

    // Получим первый проект для привязки
    const firstProject = await prisma.project.findFirst({
      orderBy: { id: 'asc' },
      select: { id: true }
    });

    if (!firstProject) {
      return NextResponse.json({
        success: false,
        error: 'Нет проектов для привязки транзакций'
      }, { status: 400 });
    }

    // Создадим ProjectTransaction для каждой expense транзакции
    const created = [];
    for (const ft of fundTransactions) {
      // Проверим, нет ли уже созданной транзакции
      const existing = await prisma.projectTransaction.findFirst({
        where: {
          comment: {
            contains: `Вывод из фонда: ${ft.fund.name}`
          }
        }
      });

      if (!existing) {
        const pt = await prisma.projectTransaction.create({
          data: {
            projectId: firstProject.id,
            amount: ft.amount,
            date: ft.date,
            comment: `Вывод из фонда: ${ft.fund.name} — ${ft.description || ''}`
          }
        });
        created.push(pt);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        processed: fundTransactions.length,
        created: created.length
      }
    });
  } catch (error) {
    console.error('Sync funds error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка проведения транзакций' },
      { status: 500 }
    );
  }
}
