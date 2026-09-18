import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const expenseSchema = z.object({
  date: z.string().datetime().or(z.string().date()),
  amount: z.coerce.number().positive(),
  recipient: z.string().min(1),
  purpose: z.string().min(1),
  category: z.preprocess((v) => v === '' || v == null ? 'other' : v, z.string().default('other')),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
  projectId: z.coerce.number().int().positive().optional().nullable(),
  stage: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    const where: any = {};
    
    if (date) {
      const d = new Date(date);
      where.date = {
        gte: new Date(d.setHours(0, 0, 0, 0)),
        lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }
    
    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { project: true },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось получить расходы' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, amount, recipient, purpose, category, supplierId, projectId, stage } = parsed.data;

    const expense = await prisma.$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: {
          date: new Date(date),
          amount,
          recipient,
          purpose,
          category,
          supplierId,
          projectId,
        },
        include: {
          supplier: true,
          project: true,
        },
      });

      // Если указан проект — добавить в смету расходов проекта (merge if exists)
      if (projectId) {
        const existing = await tx.projectOverhead.findFirst({
          where: {
            projectId: Number(projectId),
            name: purpose,
            category: category || null,
          },
        });

        if (existing) {
          // Sum costs
          const existingCost = Number(existing.cost) || 0;
          await tx.projectOverhead.update({
            where: { id: existing.id },
            data: {
              cost: existingCost + amount,
            },
          });
        } else {
          await tx.projectOverhead.create({
            data: {
              projectId: Number(projectId),
              name: purpose,
              cost: amount,
              category: category || null,
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось создать расход' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID не указан' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = expenseSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, amount, recipient, purpose, category, supplierId, projectId } = parsed.data;

    // Преобразуем supplierId и projectId корректно
    let supplierIdValue: number | null | undefined = undefined;
    if (supplierId !== undefined) {
      const numSupplierId = Number(supplierId);
      supplierIdValue = isNaN(numSupplierId) || numSupplierId <= 0 ? null : numSupplierId;
    }

    let projectIdValue: number | null | undefined = undefined;
    if (projectId !== undefined) {
      const numProjectId = Number(projectId);
      projectIdValue = isNaN(numProjectId) || numProjectId <= 0 ? null : numProjectId;
    }

    const expense = await prisma.expense.update({
      where: { id: Number(id) },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount !== undefined ? Number(amount) : undefined,
        recipient: recipient !== undefined ? recipient : undefined,
        purpose: purpose !== undefined ? purpose : undefined,
        category: category !== undefined ? category : undefined,
        supplierId: supplierIdValue,
        projectId: projectIdValue,
      },
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error('PATCH /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось обновить расход' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID не указан' },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Получаем расход перед удалением
      const expense = await tx.expense.findUnique({
        where: { id: Number(id) },
        select: { projectId: true, purpose: true, category: true, amount: true },
      });

      if (!expense) {
        throw new Error('Расход не найден');
      }

      // Удаляем соответствующую запись из сметы расходов (если был проект)
      if (expense.projectId) {
        const overhead = await tx.projectOverhead.findFirst({
          where: {
            projectId: expense.projectId,
            name: expense.purpose,
            category: expense.category || null,
          },
        });

        if (overhead) {
          // Если сумма совпадает — удаляем entirely, иначе уменьшаем
          if (overhead.cost === expense.amount) {
            await tx.projectOverhead.delete({
              where: { id: overhead.id },
            });
          } else {
            await tx.projectOverhead.update({
              where: { id: overhead.id },
              data: {
                cost: Math.max(0, overhead.cost - expense.amount),
              },
            });
          }
        }
      }

      // Удаляем расход
      await tx.expense.delete({
        where: { id: Number(id) },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось удалить расход' },
      { status: 500 }
    );
  }
}
