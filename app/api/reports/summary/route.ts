import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'day';
    const date = searchParams.get('date');
    const weekStartParam = searchParams.get('weekStart');
    const weekEndParam = searchParams.get('weekEnd');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let startDate: Date;
    let endDate: Date;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (period === 'day' && date) {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week' && weekStartParam && weekEndParam) {
      startDate = new Date(weekStartParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(weekEndParam);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      const weekEnd = date ? new Date(date) : today;
      weekEnd.setHours(23, 59, 59, 999);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      startDate = weekStart;
      endDate = weekEnd;
    } else if (period === 'month' && month) {
      const [y, m] = month.split('-').map(Number);
      startDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
      endDate = new Date(y, m, 0, 23, 59, 59, 999);
    } else if (period === 'year' && year) {
      const y = parseInt(year);
      startDate = new Date(y, 0, 1, 0, 0, 0, 0);
      endDate = new Date(y, 11, 31, 23, 59, 59, 999);
    } else {
      startDate = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = today;
    }

    // Получаем доходы (транзакции проектов)
    const transactions = await prisma.projectTransaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        project: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Получаем расходы
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Получаем авансы
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
      orderBy: { date: 'desc' },
    });

    const totalAdvances = advanceReports.reduce((sum, r) => sum + r.totalAmount, 0);

    // Получаем зарплатные отчеты
    const salaryReports = await prisma.salaryReport.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: { date: 'desc' },
    });

    const totalSalary = salaryReports.reduce((sum, r) => sum + r.totalAmount, 0);

    // Получаем ЕОТ отчеты
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
      orderBy: { date: 'desc' },
    });

    const totalEOT = (eotReports || []).reduce((sum, r) => sum + r.totalAmount, 0);

    const totalIncomeAll = totalIncome + totalAdvances;
    const totalExpenseAll = totalExpense + totalSalary + totalEOT;
    const profit = totalIncomeAll - totalExpenseAll;

    // Для графика по месяцам — fetch-all + grouping (1 запрос на таблицу вместо 60)
    interface MonthData { income: number; expense: number; };
    let monthlyData: { month: string; income: number; expense: number; profit: number }[] = [];
    if (period === 'year' && year) {
      const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
      ];

      const [transactions, expenses, advanceReportsAll, salaryReportsAll, eotReportsAll] =
        await Promise.all([
          prisma.projectTransaction.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { amount: true, date: true },
          }),
          prisma.expense.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { amount: true, date: true },
          }),
          prisma.advanceReport.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { totalAmount: true, date: true },
          }),
          prisma.salaryReport.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { totalAmount: true, date: true },
          }),
          prisma.eOTReport.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            select: { totalAmount: true, date: true },
          }),
        ]);

      const buckets: MonthData[] = monthNames.map(() => ({ income: 0, expense: 0 }));

      type ItemWithDate = { amount?: number; totalAmount?: number; date: Date };

      const addIncome = (items: ItemWithDate[], key: 'amount' | 'totalAmount') => {
        for (const item of items) {
          buckets[item.date.getUTCMonth()].income += item[key] ?? 0;
        }
      };

      const addExpense = (items: ItemWithDate[], key: 'amount' | 'totalAmount') => {
        for (const item of items) {
          buckets[item.date.getUTCMonth()].expense += item[key] ?? 0;
        }
      };

      addIncome(transactions, 'amount');
      addIncome(advanceReportsAll, 'totalAmount');
      addExpense(expenses, 'amount');
      addExpense(salaryReportsAll, 'totalAmount');
      addExpense(eotReportsAll, 'totalAmount');

      monthlyData = buckets.map((b, i) => ({
        month: monthNames[i],
        income: b.income,
        expense: b.expense,
        profit: b.income - b.expense,
      }));
    }

    return successResponse({
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      income: {
        total: totalIncome,
        transactions: transactions.map(t => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          comment: t.comment,
          projectName: t.project.name,
          projectCode: t.project.code,
        })),
      },
      advances: {
        total: totalAdvances,
        reports: advanceReports.map(r => ({
          id: r.id,
          date: r.date,
          totalAmount: r.totalAmount,
          items: r.items.map(i => ({
            employeeName: i.employeeName,
            amount: i.amount,
            purpose: i.purpose,
          })),
        })),
      },
      expenses: {
        total: totalExpense,
        items: expenses.map(e => ({
          id: e.id,
          date: e.date,
          amount: e.amount,
          recipient: e.recipient,
          purpose: e.purpose,
          category: e.category,
        })),
      },
      salary: {
        total: totalSalary,
        reports: salaryReports.map(r => ({
          id: r.id,
          date: r.date,
          period: r.period,
          totalAmount: r.totalAmount,
          status: r.status,
          items: r.items.map(i => ({
            employeeName: i.employeeName,
            amount: i.amount,
            period: i.period,
            grossSalary: i.grossSalary,
            advances: i.advances,
            penalties: i.penalties,
            bonuses: i.bonuses,
            isPaid: i.isPaid,
          })),
        })),
      },
      eot: {
        total: totalEOT,
        reports: eotReports.map(r => ({
          id: r.id,
          date: r.date,
          totalAmount: r.totalAmount,
          status: r.status,
          items: r.items.map(i => ({
            employeeName: i.employeeName,
            paymentType: i.paymentType,
            salary: i.salary,
            comment: i.comment,
          })),
        })),
      },
      summary: {
        totalIncome: totalIncomeAll,
        totalExpense: totalExpenseAll,
        profit,
      },
      monthlyData,
    });
  } catch (error) {
    console.error('GET /api/reports/summary error:', error);
    return errorResponse('Не удалось получить общий отчет', 500);
  }
}
