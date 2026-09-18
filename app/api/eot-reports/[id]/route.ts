import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// PATCH /api/eot-reports/[id] - обновить конкретный отчет
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = await context.params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return errorResponse('Некорректный ID отчета', 400);
    }

    const report = await prisma.eOTReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return errorResponse('Отчет не найден', 404);
    }

    // Используем локальную дату из БД (без конвертации в UTC)
    const dateObj = report.date instanceof Date ? report.date : new Date(report.date);
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1;
    const d = dateObj.getDate();
    // Создаем дату в локальном времени (не UTC)
    const targetDate = new Date(y, m - 1, d, 0, 0, 0, 0);
    const nextDate = new Date(y, m - 1, d + 1, 0, 0, 0, 0);

    console.log(`[EOT PATCH] report.date: ${report.date.toISOString()}`);
    console.log(`[EOT PATCH] targetDate: ${targetDate.toISOString()}`);
    console.log(`[EOT PATCH] nextDate: ${nextDate.toISOString()}`);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: { gte: targetDate, lt: nextDate },
        hours: { gt: 0 },
      },
      include: { employee: { include: { hourlyRate: true } } },
    });

    console.log(`[EOT PATCH] Date: ${report.date.toISOString().split('T')[0]}, schedules count: ${schedules.length}`);
    schedules.forEach(s => {
      console.log(`[EOT PATCH]   Employee ${s.employee.fullName}: hours=${s.hours}`);
    });

    if (schedules.length === 0) {
      return errorResponse('Нет смен за эту дату', 400);
    }

    const employeeMap = new Map();
    for (const sched of schedules) {
      const existing = employeeMap.get(sched.employeeId);
      if (existing) {
        existing.hours += sched.hours || 0;
      } else {
        employeeMap.set(sched.employeeId, {
          hours: sched.hours || 0,
          employee: sched.employee,
        });
      }
    }

    console.log(`[EOT PATCH] Aggregated hours:`);
    for (const [empId, data] of employeeMap) {
      console.log(`[EOT PATCH]   Employee ${data.employee.fullName}: total hours=${data.hours}`);
    }

    const items = [];
    let totalAmount = 0;

    for (const [empId, data] of employeeMap) {
      const { hours, employee } = data;
      const paymentType = employee.paymentType || '';

      let salary = 0;
      let rate = 0;
      let quantity = 0;
      let workAmount = 0;
      let shopReportId: number | null = null;

      if (paymentType.includes('смен')) {
        rate = employee.hourlyRate?.rate || 0;
        salary = hours * rate;
      } else if (paymentType.includes('сдел')) {
        const shopReports = await prisma.shopReport.findMany({
          where: {
            employeeId: empId,
            date: { gte: targetDate, lt: nextDate },
          },
          include: { items: true },
        });

        for (const shopReport of shopReports) {
          for (const item of shopReport.items) {
            quantity += item.quantity || 0;
            workAmount += item.amount || 0;
          }
          if (!shopReportId) shopReportId = shopReport.id;
        }

        if (workAmount === 0) {
          const empWorkReports = await prisma.employeeWorkReport.findMany({
            where: {
              employeeId: empId,
              date: { gte: targetDate, lt: nextDate },
            },
          });

          for (const wr of empWorkReports) {
            workAmount += wr.amount || 0;
          }
        }

        salary = workAmount;
      }

      totalAmount += salary;

      const item: any = {
        employeeId: empId,
        employeeName: employee.fullName,
        paymentType,
        salary: salary ?? 0,
        comment: '',
      };
      if (paymentType.includes('смен') && hours) item.hours = hours;
      if (paymentType.includes('смен') && rate) item.rate = rate;
      if (paymentType.includes('сдел')) {
        if (quantity) item.quantity = quantity;
        if (workAmount) item.workAmount = workAmount;
        if (shopReportId) item.shopReportId = shopReportId;
      }

      items.push(item);
    }

    // Удаляем старые items и создаем новые
    await prisma.eOTReportItem.deleteMany({
      where: { reportId: report.id },
    });

    const updatedReport = await prisma.eOTReport.update({
      where: { id: report.id },
      data: {
        totalAmount: totalAmount || 0,
        status: 'pending',
        items: { create: items },
      },
      include: { items: true },
    });

    return successResponse(updatedReport);
  } catch (error) {
    console.error('PATCH /api/eot-reports/[id] error:', error);
    return errorResponse('Не удалось обновить ЕОТ', 500);
  }
}
