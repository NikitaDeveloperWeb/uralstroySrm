import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return errorResponse('Укажите месяц и год', 400);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Загружаем все ЕОТ за месяц
    const eotReports = await prisma.eOTReport.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    // Загружаем все авансы за месяц
    const advanceReports = await prisma.advanceReport.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    // Считаем начисления по каждому сотруднику (из ЕОТ)
    const salaryMap = new Map<number, {
      name: string;
      totalSalary: number;
      days: number;
      shifts: number;
      hours: number;
    }>();

    for (const eot of eotReports) {
      for (const item of eot.items) {
        const existing = salaryMap.get(item.employeeId);
        if (existing) {
          existing.totalSalary += item.salary;
          existing.days += 1;
        } else {
          salaryMap.set(item.employeeId, {
            name: item.employeeName,
            totalSalary: item.salary,
            days: 1,
            shifts: 0,
            hours: 0,
          });
        }
      }
    }

    // Считаем смены и часы по каждому сотруднику из расписания
    const schedules = await prisma.schedule.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'отменен',
        },
      },
    });

    const scheduleMap = new Map<number, { shifts: number; hours: number }>();
    for (const schedule of schedules) {
      const existing = scheduleMap.get(schedule.employeeId);
      if (existing) {
        existing.shifts += 1;
        existing.hours += schedule.hours || 0;
      } else {
        scheduleMap.set(schedule.employeeId, {
          shifts: 1,
          hours: schedule.hours || 0,
        });
      }
    }

    // Считаем выданные авансы по каждому сотруднику
    const advanceMap = new Map<number, number>();
    for (const advance of advanceReports) {
      for (const item of advance.items) {
        const existing = advanceMap.get(item.employeeId) || 0;
        advanceMap.set(item.employeeId, existing + item.amount);
      }
    }

    // Считаем штрафы по каждому сотруднику
    const penaltiesReports = await prisma.penalty.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const penaltyMap = new Map<number, number>();
    for (const penalty of penaltiesReports) {
      const existing = penaltyMap.get(penalty.employeeId) || 0;
      penaltyMap.set(penalty.employeeId, existing + penalty.amount);
    }

    // Считаем премии по каждому сотруднику
    const bonusReports = await prisma.bonus.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const bonusMap = new Map<number, number>();
    for (const bonus of bonusReports) {
      const existing = bonusMap.get(bonus.employeeId) || 0;
      bonusMap.set(bonus.employeeId, existing + bonus.amount);
    }

    // Формируем итоговый список сотрудников
    const entries = Array.from(salaryMap.entries()).map(([employeeId, data]) => {
      const advances = advanceMap.get(employeeId) || 0;
      const penalties = penaltyMap.get(employeeId) || 0;
      const bonuses = bonusMap.get(employeeId) || 0;
      const netAmount = Math.round(data.totalSalary + bonuses - advances - penalties);
      const scheduleData = scheduleMap.get(employeeId);
      
      return {
        employeeId,
        employeeName: data.name,
        grossSalary: Math.round(data.totalSalary + bonuses),
        advances,
        penalties,
        bonuses,
        netAmount: Math.max(0, netAmount), // Не отрицательная зарплата
        days: data.days,
        shifts: scheduleData?.shifts || 0,
        hours: scheduleData?.hours || 0,
        period: `${month}/${year}`,
      };
    });

    if (entries.length === 0) {
      return errorResponse('Нет данных за указанный месяц', 400);
    }

    // Проверяем существующий отчет за этот период
    const existing = await prisma.salaryReport.findFirst({
      where: { period: `${month}/${year}` },
      include: { items: true },
    });

    let report;
    if (existing) {
      // Удаляем старый отчет полностью и создаем новый
      await prisma.salaryReport.delete({
        where: { id: existing.id },
      });
      
      report = await prisma.salaryReport.create({
        data: {
          date: new Date(),
          period: `${month}/${year}`,
          totalAmount: entries.reduce((sum, e) => sum + e.netAmount, 0),
          status: 'pending',
          items: {
            create: entries.map(e => ({
              employeeId: e.employeeId,
              employeeName: e.employeeName,
              amount: e.netAmount,
              period: `${month}/${year}`,
              grossSalary: e.grossSalary,
              advances: e.advances,
              penalties: e.penalties,
              bonuses: e.bonuses,
              days: e.days,
              shifts: e.shifts,
              hours: e.hours,
              isPaid: false,
            })),
          },
        },
        include: { items: true },
      });
    } else {
      // Создаем новый отчет
      report = await prisma.salaryReport.create({
        data: {
          date: new Date(),
          period: `${month}/${year}`,
          totalAmount: entries.reduce((sum, e) => sum + e.netAmount, 0),
          status: 'pending',
          items: {
            create: entries.map(e => ({
              employeeId: e.employeeId,
              employeeName: e.employeeName,
              amount: e.netAmount,
              period: `${month}/${year}`,
              grossSalary: e.grossSalary,
              advances: e.advances,
              penalties: e.penalties,
              bonuses: e.bonuses,
              days: e.days,
              shifts: e.shifts,
              hours: e.hours,
              isPaid: false,
            })),
          },
        },
        include: { items: true },
      });
    }

    return successResponse(report, existing ? 200 : 201);
  } catch (error) {
    console.error('POST /api/salary-reports/generate error:', error);
    return errorResponse('Не удалось создать зарплатный отчет', 500);
  }
}
