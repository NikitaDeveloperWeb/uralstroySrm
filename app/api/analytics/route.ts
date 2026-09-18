import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // 1. Доходы vs Расходы по месяцам
    const transactions = await prisma.projectTransaction.findMany({
      where: {
        date: { gte: sixMonthsAgo },
      },
      select: {
        date: true,
        amount: true,
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        date: { gte: sixMonthsAgo },
      },
      select: {
        date: true,
        amount: true,
        category: true,
      },
    });

    console.log('Transactions count (6mo):', transactions.length);
    console.log('Expenses count (6mo):', expenses.length);
    if (transactions.length > 0) console.log('Transaction dates:', transactions.slice(0, 5).map(t => t.date));
    if (expenses.length > 0) console.log('Expense dates:', expenses.slice(0, 5).map(e => e.date));

    const monthlyIncomeExpense: any[] = [];
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });

      const monthExpenses = expenses.filter(e => {
        const eDate = new Date(e.date);
        return `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}` === monthKey;
      });

      monthlyIncomeExpense.unshift({
        month: `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        income: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
        expense: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      });
    }

    // 2. Расходы по категориям
    const expenseByCategoryMap = new Map<string, number>();
    expenses.forEach(e => {
      const cat = (e.category && e.category.trim()) || 'Прочее';
      expenseByCategoryMap.set(cat, (expenseByCategoryMap.get(cat) || 0) + e.amount);
    });

    const expenseByCategory = Array.from(expenseByCategoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    if (expenseByCategory.length === 0) {
      const allExpenses = await prisma.expense.findMany({
        select: { category: true, amount: true, date: true },
        take: 10,
      });
      console.log('All expenses sample:', allExpenses);
    }

    // 3. Динамика зарплат
    const salaryReports = await prisma.salaryReport.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { date: true, totalAmount: true },
    });

    const salaryTrend = salaryReports
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({
        month: new Date(r.date).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        amount: r.totalAmount,
      }));

    // 4. Бонусы и штрафы за последние 6 месяцев
    const bonuses = await prisma.bonus.aggregate({
      where: { createdAt: { gte: sixMonthsAgo } },
      _sum: { amount: true },
    });

    const penalties = await prisma.penalty.aggregate({
      where: { createdAt: { gte: sixMonthsAgo } },
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
        transactions: { select: { amount: true } },
      },
    });

    const projectProfit = projects.map(p => {
      const totalIncome = p.transactions.reduce((s, t) => s + t.amount, 0);
      const totalExpense = p.cost || 0;
      return {
        project: p.name,
        profit: totalIncome - totalExpense,
      };
    }).sort((a, b) => b.profit - a.profit);

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
      { name: 'Отчеты о выполненной работе', value: shopReportsCount },
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
