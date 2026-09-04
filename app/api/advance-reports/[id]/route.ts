import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/advance-reports/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const report = await prisma.advanceReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Авансовый отчет не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('GET /api/advance-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось получить отчет' },
      { status: 500 }
    );
  }
}

// PATCH /api/advance-reports/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { date, entries } = body;

    const report = await prisma.advanceReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Авансовый отчет не найден' },
        { status: 404 }
      );
    }

    const totalAmount = entries.reduce((sum: number, e: any) => sum + e.amount, 0);

    const updated = await prisma.$transaction(async (tx) => {
      // Update report header
      const reportUpdate: any = {};
      if (date) reportUpdate.date = new Date(date);
      reportUpdate.totalAmount = totalAmount;

      await tx.advanceReport.update({
        where: { id: Number(id) },
        data: reportUpdate,
      });

      // Delete old items
      await tx.advanceReportItem.deleteMany({
        where: { reportId: Number(id) },
      });

      // Create new items
      const createdItems = await tx.advanceReportItem.createMany({
        data: entries.map((e: any) => ({
          reportId: Number(id),
          employeeId: e.employeeId,
          employeeName: e.employeeName,
          amount: e.amount,
          purpose: e.purpose,
        })),
      });

      return tx.advanceReport.findUnique({
        where: { id: Number(id) },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/advance-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось обновить отчет' },
      { status: 500 }
    );
  }
}

// DELETE /api/advance-reports/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const report = await prisma.advanceReport.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Авансовый отчет не найден' },
        { status: 404 }
      );
    }

    await prisma.advanceReport.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/advance-reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось удалить отчет' },
      { status: 500 }
    );
  }
}
