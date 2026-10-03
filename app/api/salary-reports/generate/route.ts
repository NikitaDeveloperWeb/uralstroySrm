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

    // Загружаем всех сотрудников
    const allEmployees = await prisma.employee.findMany({
      include: { hourlyRate: true },
    });
    
    const employeeInfoMap = new Map<number, {
      name: string;
      paymentType: string;
      monthlySalary: number;
      hourlyRate: number;
    }>();
    
    for (const emp of allEmployees) {
      employeeInfoMap.set(emp.id, {
        name: emp.fullName,
        paymentType: emp.paymentType || '',
        monthlySalary: emp.monthlySalary || 0,
        hourlyRate: emp.hourlyRate?.rate || 0,
      });
    }

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

    // Загружаем все расписания за месяц
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

    // Считаем часы из расписания по каждому сотруднику
    const scheduleHoursMap = new Map<number, number>();
    const scheduleShiftsMap = new Map<number, number>();
    
    for (const schedule of schedules) {
      const hours = schedule.hours || 0;
      const existingHours = scheduleHoursMap.get(schedule.employeeId) || 0;
      const existingShifts = scheduleShiftsMap.get(schedule.employeeId) || 0;
      
      scheduleHoursMap.set(schedule.employeeId, existingHours + hours);
      if (hours > 0) {
        scheduleShiftsMap.set(schedule.employeeId, existingShifts + 1);
      }
    }

    // Считаем начисления из ЕОТ по каждому сотруднику
    const eotSalaryMap = new Map<number, number>();
    const eotDaysMap = new Map<number, number>();
    
    for (const eot of eotReports) {
      for (const item of eot.items) {
        const existingSalary = eotSalaryMap.get(item.employeeId) || 0;
        const existingDays = eotDaysMap.get(item.employeeId) || 0;
        
        eotSalaryMap.set(item.employeeId, existingSalary + item.salary);
        eotDaysMap.set(item.employeeId, existingDays + 1);
      }
    }

    // Загружаем авансы
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

    const advanceMap = new Map<number, number>();
    for (const advance of advanceReports) {
      for (const item of advance.items) {
        const existing = advanceMap.get(item.employeeId) || 0;
        advanceMap.set(item.employeeId, existing + item.amount);
      }
    }

    // Считаем штрафы
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

    // Считаем премии
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
    const entries = Array.from(employeeInfoMap.entries())
      .filter(([employeeId]) => {
        // Включаем сотрудников, у которых есть начисления в ЕОТ
        const hasEOTSalary = (eotSalaryMap.get(employeeId) || 0) > 0;
        return hasEOTSalary;
      })
      .map(([employeeId, empInfo]) => {
        const advances = advanceMap.get(employeeId) || 0;
        const penalties = penaltyMap.get(employeeId) || 0;
        const bonuses = bonusMap.get(employeeId) || 0;
        
        const scheduleHours = scheduleHoursMap.get(employeeId) || 0;
        const scheduleShifts = scheduleShiftsMap.get(employeeId) || 0;
        const eotSalary = eotSalaryMap.get(employeeId) || 0;
        const eotDays = eotDaysMap.get(employeeId) || 0;
        
        let grossSalary: number;
        let hours: number;
        let shifts: number;
        let days: number;
        
        if (empInfo.paymentType === 'оклад') {
          // Для окладных: grossSalary не может превышать monthlySalary
          grossSalary = Math.min(eotSalary, empInfo.monthlySalary);
          hours = scheduleHours;
          shifts = scheduleShifts;
          days = eotDays;
        } else if (empInfo.paymentType.includes('смен')) {
          // Для сменных: из ЕОТ
          hours = scheduleHours;
          shifts = scheduleShifts;
          days = eotDays;
          grossSalary = eotSalary;
        } else if (empInfo.paymentType.includes('сдел')) {
          // Для сдельных: из ЕОТ
          grossSalary = eotSalary;
          hours = scheduleHours;
          shifts = scheduleShifts;
          days = eotDays;
        } else {
          // По умолчанию из ЕОТ
          grossSalary = eotSalary;
          hours = scheduleHours;
          shifts = scheduleShifts;
          days = eotDays;
        }
        
        const netAmount = Math.round(grossSalary + bonuses - advances - penalties);
        
        return {
          employeeId,
          employeeName: empInfo.name,
          grossSalary,
          advances,
          penalties,
          bonuses,
          netAmount: Math.max(0, netAmount),
          days,
          shifts,
          hours,
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
