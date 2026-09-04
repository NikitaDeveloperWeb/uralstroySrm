import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 1. Доходы vs Расходы по месяцам
    const transactions = await prisma.projectTransaction.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    const monthlyIncomeExpense: any[] = [];
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.createdAt);
        return `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });

      monthlyIncomeExpense.unshift({
        month: `${months[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        income: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        expense: 0,
      });
    }

    // 2. Расходы по категориям
    const expenses = await prisma.expense.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { category: true, amount: true },
    });

    const categoryLabels: Record<string, string> = {
      'materials': 'Материалы',
      'equipment': 'Оборудование',
      'transport': 'Транспорт',
      'labor': 'Рабочие',
      'other': 'Прочее',
      'rent': 'Аренда',
      'food': 'Питание',
    };

    const expenseByCategoryMap = new Map<string, number>();
    expenses.forEach(e => {
      expenseByCategoryMap.set(e.category, (expenseByCategoryMap.get(e.category) || 0) + e.amount);
    });

    const expenseByCategory = Array.from(expenseByCategoryMap.entries()).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
    }));

    // 3. Динамика зарплат
    const salaryReports = await prisma.salaryReport.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { period: true, totalAmount: true },
    });

    const salaryTrend = Array.from(new Set(salaryReports.map(r => r.period))).map(period => ({
      month: period,
      amount: salaryReports.filter(r => r.period === period).reduce((sum, r) => sum + r.totalAmount, 0),
    }));

    // 4. Бонусы и штрафы
    const bonuses = await prisma.bonus.aggregate({
      _sum: { amount: true },
    });

    const penalties = await prisma.penalty.aggregate({
      _sum: { amount: true },
    });

    const bonusPenaltyData = [
      { name: 'Бонусы', value: bonuses._sum.amount || 0 },
      { name: 'Штрафы', value: penalties._sum.amount || 0 },
    ];

    // 5. Топ проектов по стоимости
    const topProjects = await prisma.project.findMany({
      orderBy: { cost: 'desc' },
      take: 5,
      select: { name: true, cost: true },
    });

    const projectCosts = topProjects.map(p => ({
      name: p.name,
      value: p.cost,
    }));

    // 6. Прибыль по проектам
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        cost: true,
        materials: { select: { cost: true } },
        completedWorks: { select: { cost: true } },
      },
    });

    const projectProfit = projects.map(p => ({
      project: p.name,
      profit: p.cost - (p.materials.reduce((s, m) => s + (m.cost || 0), 0) + p.completedWorks.reduce((s, w) => s + (w.cost || 0), 0)),
    }));

    // 7. Динамика расходов по дням
    const dailyExpenses = await prisma.expense.findMany({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 1, 1) } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true, amount: true },
    });

    const dailyExpensesData = dailyExpenses.map(item => ({
      date: new Date(item.createdAt).toLocaleDateString('ru-RU'),
      amount: item.amount,
    }));

    // 8. Отношение доходов к расходам
    const incomeExpenseRatio = monthlyIncomeExpense.map(m => ({
      month: m.month,
      ratio: m.expense > 0 ? m.income / m.expense : 0,
    }));

    // 9. Отчеты по типам
    const [shopReportsCount, eotReportsCount, salaryReportsCount, advanceReportsCount] = await Promise.all([
      prisma.shopReport.count(),
      prisma.eOTReport.count(),
      prisma.salaryReport.count(),
      prisma.advanceReport.count(),
    ]);

    const reportsByType = [
      { name: 'Отчеты цеха', value: shopReportsCount },
      { name: 'ЕОТ отчеты', value: eotReportsCount },
      { name: 'Отчеты по зарплате', value: salaryReportsCount },
      { name: 'Авансовые отчеты', value: advanceReportsCount },
    ];

    // 10. Статусы проектов
    const projectStatuses = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const projectStatusesData = projectStatuses.map(item => ({
      name: item.status,
      value: item._count.id,
    }));

    return NextResponse.json({
      monthlyIncomeExpense,
      expenseByCategory,
      salaryTrend,
      bonusPenaltyData,
      projectCosts,
      projectProfit,
      dailyExpenses: dailyExpensesData,
      incomeExpenseRatio,
      reportsByType,
      projectStatuses: projectStatusesData,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
