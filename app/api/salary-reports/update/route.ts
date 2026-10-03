import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, regenerate } = body;

    if (!period) {
      return errorResponse('Укажите период в формате месяц/год (например: 10/2026)', 400);
    }

    // Находим существующий отчет
    const existingReport = await prisma.salaryReport.findFirst({
      where: { period },
      include: { items: true },
    });

    if (!existingReport) {
      return errorResponse('Отчет за период ' + period + ' не найден', 404);
    }

    // Проверяем, были ли выплаты
    const hasPaidItems = existingReport.items.some(item => item.isPaid);
    if (hasPaidItems) {
      return errorResponse('Нельзя обновить отчет, по которому уже были выплаты', 400);
    }

    // Удаляем старые элементы
    await prisma.salaryReportItem.deleteMany({
      where: { reportId: existingReport.id },
    });

    // Если regenerate=true — пересчитываем заново из расписания
    if (regenerate) {
      const [monthStr, yearStr] = period.split('/');
      const month = parseInt(monthStr);
      const year = parseInt(yearStr);
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // Загружаем всех сотрудников
      const allEmployees = await prisma.employee.findMany({
        include: { hourlyRate: true },
      });
      
      const employeeInfoMap = new Map();
      for (const emp of allEmployees) {
        employeeInfoMap.set(emp.id, {
          name: emp.fullName,
          paymentType: emp.paymentType || '',
          monthlySalary: emp.monthlySalary || 0,
          hourlyRate: emp.hourlyRate?.rate || 0,
        });
      }

      // Загружаем расписания
      const schedules = await prisma.schedule.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          status: { not: 'отменен' },
        },
      });

      const scheduleHoursMap = new Map();
      const scheduleShiftsMap = new Map();
      
      for (const schedule of schedules) {
        const hours = schedule.hours || 0;
        const existingHours = scheduleHoursMap.get(schedule.employeeId) || 0;
        const existingShifts = scheduleShiftsMap.get(schedule.employeeId) || 0;
        scheduleHoursMap.set(schedule.employeeId, existingHours + hours);
        if (hours > 0) {
          scheduleShiftsMap.set(schedule.employeeId, existingShifts + 1);
        }
      }

      // Загружаем авансы
      const advanceReports = await prisma.advanceReport.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        include: { items: true },
      });

      const advanceMap = new Map();
      for (const advance of advanceReports) {
        for (const item of advance.items) {
          const existing = advanceMap.get(item.employeeId) || 0;
          advanceMap.set(item.employeeId, existing + item.amount);
        }
      }

      // Загружаем штрафы
      const penaltiesReports = await prisma.penalty.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      });

      const penaltyMap = new Map();
      for (const penalty of penaltiesReports) {
        const existing = penaltyMap.get(penalty.employeeId) || 0;
        penaltyMap.set(penalty.employeeId, existing + penalty.amount);
      }

      // Загружаем премии
      const bonusReports = await prisma.bonus.findMany({
        where: { date: { gte: startDate, lte: endDate } },
      });

      const bonusMap = new Map();
      for (const bonus of bonusReports) {
        const existing = bonusMap.get(bonus.employeeId) || 0;
        bonusMap.set(bonus.employeeId, existing + bonus.amount);
      }

      // Формируем новые элементы
      const newItems = [];
      
      for (const [employeeId, empInfo] of employeeInfoMap) {
        const scheduleHours = scheduleHoursMap.get(employeeId) || 0;
        const scheduleShifts = scheduleShiftsMap.get(employeeId) || 0;
        const advances = advanceMap.get(employeeId) || 0;
        const penalties = penaltyMap.get(employeeId) || 0;
        const bonuses = bonusMap.get(employeeId) || 0;
        
        if (scheduleHours === 0) continue;
        
        let grossSalary;
        let netAmount;
        
        if (empInfo.paymentType === 'оклад') {
          grossSalary = empInfo.monthlySalary;
          netAmount = Math.round(grossSalary + bonuses - advances - penalties);
        } else if (empInfo.paymentType.includes('смен')) {
          grossSalary = Math.round(scheduleHours * empInfo.hourlyRate);
          netAmount = Math.round(grossSalary + bonuses - advances - penalties);
        } else {
          grossSalary = 0;
          netAmount = Math.round(grossSalary + bonuses - advances - penalties);
        }
        
        newItems.push({
          employeeId,
          employeeName: empInfo.name,
          amount: Math.max(0, netAmount),
          period,
          grossSalary,
          advances,
          penalties,
          bonuses,
          days: 0,
          shifts: scheduleShifts,
          hours: scheduleHours,
          isPaid: false,
        });
      }

      if (newItems.length === 0) {
        return errorResponse('Нет данных для пересчета за период ' + period, 400);
      }

      // Обновляем отчет
      await prisma.salaryReport.update({
        where: { id: existingReport.id },
        data: {
          date: new Date(),
          totalAmount: newItems.reduce((sum, e) => sum + e.amount, 0),
          items: {
            create: newItems,
          },
        },
        include: { items: true },
      });

      return successResponse({ 
        message: 'Отчет пересчитан',
        itemsCount: newItems.length,
        totalAmount: newItems.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    // Если regenerate=false — просто обновляем дату отчета
    await prisma.salaryReport.update({
      where: { id: existingReport.id },
      data: {
        date: new Date(),
      },
    });

    return successResponse({ message: 'Отчет обновлен' });
  } catch (error) {
    console.error('POST /api/salary-reports/update error:', error);
    return errorResponse('Не удалось обновить отчет', 500);
  }
}
