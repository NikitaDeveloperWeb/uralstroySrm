import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// GET /api/employee-advances - получить все подотчетные
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    const where: any = {};
    if (employeeId) where.employeeId = Number(employeeId);
    if (date) {
      const [y, m, d] = date.split('-').map(Number);
      const from = new Date(y, m - 1, d, 0, 0, 0, 0);
      const to = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
      where.date = { gte: from, lt: to };
    }

    const advances = await prisma.employeeAdvance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return successResponse(advances);
  } catch (error) {
    console.error('GET /api/employee-advances error:', error);
    return errorResponse('Не удалось получить подотчетные', 500);
  }
}

// POST /api/employee-advances - создать подотчет
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, employeeName, amount, date, purpose } = body;

    if (!employeeId || !employeeName || !amount) {
      return errorResponse('Укажите сотрудника, сумму и дату', 400);
    }

    const advance = await prisma.employeeAdvance.create({
      data: {
        employeeId: Number(employeeId),
        employeeName,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        purpose: purpose || null,
      },
    });

    return successResponse(advance, 201);
  } catch (error) {
    console.error('POST /api/employee-advances error:', error);
    return errorResponse('Не удалось создать подотчет', 500);
  }
}

// PATCH /api/employee-advances/:id - обновить статус (погашен)
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const advanceId = parseInt(id, 10);

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse('Укажите статус', 400);
    }

    const advance = await prisma.employeeAdvance.update({
      where: { id: advanceId },
      data: { status },
    });

    return successResponse(advance);
  } catch (error) {
    console.error('PATCH /api/employee-advances/:id error:', error);
    return errorResponse('Не удалось обновить подотчет', 500);
  }
}

// DELETE /api/employee-advances/:id - удалить подотчет
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const advanceId = parseInt(id, 10);

    await prisma.employeeAdvance.delete({
      where: { id: advanceId },
    });

    return successResponse({ message: 'Подотчет удален' });
  } catch (error) {
    console.error('DELETE /api/employee-advances/:id error:', error);
    return errorResponse('Не удалось удалить подотчет', 500);
  }
}
