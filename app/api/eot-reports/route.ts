import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// GET /api/eot-reports - получить все отчеты или по дате
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const where: any = {};
    if (date) {
      const [y, m, day] = date.split('-').map(Number);
      const from = new Date(y, m - 1, day, 0, 0, 0, 0);
      const to = new Date(y, m - 1, day + 1, 0, 0, 0, 0);
      where.date = { gte: from, lt: to };
    }

    const reports = await prisma.eOTReport.findMany({
      where,
      include: { items: true },
      orderBy: { date: 'desc' },
    });

    return successResponse(reports);
  } catch (error) {
    console.error('GET /api/eot-reports error:', error);
    return errorResponse('Failed to load EOT', 500);
  }
}

// POST /api/eot-reports - создать/обновить отчет по дате
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;

    if (!date) {
      return errorResponse('Укажите дату', 400);
    }

    const [y, m, d] = date.split('-').map(Number);
    // Создаем дату в локальном времени (не UTC)
    const targetDate = new Date(y, m - 1, d, 0, 0, 0, 0);
    const nextDate = new Date(y, m - 1, d + 1, 0, 0, 0, 0);

    console.log(`[EOT POST] date input: ${date}`);
    console.log(`[EOT POST] targetDate: ${targetDate.toISOString()}`);
    console.log(`[EOT POST] nextDate: ${nextDate.toISOString()}`);

    const schedules = await prisma.schedule.findMany({
      where: {
        date: { gte: targetDate, lt: nextDate },
        hours: { gt: 0 },
      },
      include: { employee: { include: { hourlyRate: true } } },
    });

    console.log(`[EOT POST] Date: ${targetDate.toISOString().split('T')[0]}, schedules count: ${schedules.length}`);
    schedules.forEach(s => {
      console.log(`[EOT POST]   Employee ${s.employee.fullName}: hours=${s.hours}`);
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

    console.log(`[EOT POST] Aggregated hours:`);
    for (const [empId, data] of employeeMap) {
      console.log(`[EOT POST]   Employee ${data.employee.fullName}: total hours=${data.hours}`);
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

        for (const report of shopReports) {
          for (const item of report.items) {
            quantity += item.quantity || 0;
            workAmount += item.amount || 0;
          }
          if (!shopReportId) shopReportId = report.id;
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

    const existing = await prisma.eOTReport.findFirst({
      where: { date: { gte: targetDate, lt: nextDate } },
      include: { items: true },
    });

    let eotReport;
    if (existing) {
      // Удаляем старые items, затем обновляем отчет
      await prisma.eOTReportItem.deleteMany({
        where: { reportId: existing.id },
      });
      eotReport = await prisma.eOTReport.update({
        where: { id: existing.id },
        data: {
          totalAmount: totalAmount || 0,
          status: 'pending',
          items: { create: items },
        },
        include: { items: true },
      });
    } else {
      eotReport = await prisma.eOTReport.create({
        data: {
          date: targetDate,
          totalAmount: totalAmount || 0,
          status: 'pending',
          items: { create: items },
        },
        include: { items: true },
      });
    }

    return successResponse(eotReport, 201);
  } catch (error) {
    console.error('POST /api/eot-reports error:', error);
    return errorResponse('Не удалось создать ЕОТ', 500);
  }
}
