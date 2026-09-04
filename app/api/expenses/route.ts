import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const expenseSchema = z.object({
  date: z.string().datetime().or(z.string().date()),
  amount: z.coerce.number().positive(),
  recipient: z.string().min(1),
  purpose: z.string().min(1),
  category: z.string().optional().default('other'),
  supplierId: z.coerce.number().int().positive().optional().nullable(),
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

    const { date, amount, recipient, purpose, category, supplierId } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        date: new Date(date),
        amount,
        recipient,
        purpose,
        category,
        supplierId,
      },
      include: {
        supplier: true,
      },
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
    await prisma.expense.delete({
      where: { id: Number(id) },
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
