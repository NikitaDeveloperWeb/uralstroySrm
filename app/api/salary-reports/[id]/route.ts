import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/salary-reports/[id]
export async function GET(
  request: Request,
  context: any
) {
  const { id } = await context.params;

  try {
    const report = await prisma.salaryReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Зарплатный отчет не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('GET /api/salary-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось получить отчет' },
      { status: 500 }
    );
  }
}

// PATCH /api/salary-reports/[id]
export async function PATCH(
  request: Request,
  context: any
) {
  const { id } = await context.params;

  try {
    const body = await request.json();
    const { date, entries, period, status } = body;

    const report = await prisma.salaryReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Зарплатный отчет не найден' },
        { status: 404 }
      );
    }

    const totalAmount = entries.reduce((sum: number, e: any) => sum + e.amount, 0);

    const updated = await prisma.$transaction(async (tx) => {
      // Update report header
      const reportUpdate: any = {};
      if (date) reportUpdate.date = new Date(date);
      if (period) reportUpdate.period = period;
      if (status) reportUpdate.status = status;
      reportUpdate.totalAmount = totalAmount;

      await tx.salaryReport.update({
        where: { id: Number(id) },
        data: reportUpdate,
      });

      // Delete old items
      await tx.salaryReportItem.deleteMany({
        where: { reportId: Number(id) },
      });

      // Create new items
      await tx.salaryReportItem.createMany({
        data: entries.map((e: any) => ({
          reportId: Number(id),
          employeeId: e.employeeId,
          employeeName: e.employeeName,
          amount: e.amount,
          period: period || report.period,
          grossSalary: e.grossSalary,
          advances: e.advances,
          penalties: e.penalties,
          days: e.days,
          shifts: e.shifts,
          hours: e.hours,
          isPaid: e.isPaid ?? false,
        })),
      });

      return tx.salaryReport.findUnique({
        where: { id: Number(id) },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/salary-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось обновить отчет' },
      { status: 500 }
    );
  }
}

// DELETE /api/salary-reports/[id]
export async function DELETE(
  request: Request,
  context: any
) {
  const { id } = await context.params;

  try {
    const report = await prisma.salaryReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Зарплатный отчет не найден' },
        { status: 404 }
      );
    }

    await prisma.salaryReport.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/salary-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось удалить отчет' },
      { status: 500 }
    );
  }
}
