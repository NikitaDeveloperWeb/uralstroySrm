import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 1. Проекты
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: 'в работе' }
    });
    const pausedProjects = await prisma.project.count({
      where: { status: 'на паузе' }
    });
    const completedProjects = await prisma.project.count({
      where: { status: 'завершен' }
    });
    const totalProjectCost = await prisma.project.aggregate({
      _sum: { cost: true }
    });
    const avgProjectCost = totalProjects > 0 
      ? Math.round((totalProjectCost._sum.cost || 0) / totalProjects)
      : 0;

    // Просроченные проекты
    const overdueProjects = await prisma.project.count({
      where: {
        deadline: { lt: today },
        status: { not: 'завершен' }
      }
    });

    // Проекты с дедлайном на этой неделе
    const upcomingDeadlines = await prisma.project.count({
      where: {
        deadline: { gte: today, lt: nextWeek },
        status: { not: 'завершен' }
      }
    });

    // 2. Сотрудники
    const totalEmployees = await prisma.employee.count();
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const employeesToday = await prisma.schedule.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        },
        status: {
          not: 'Отсутствует'
        }
      }
    });

    // 3. Финансы за текущий месяц
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const allTransactions = await prisma.projectTransaction.findMany({
      where: {
        date: {
          gte: firstDayOfMonth,
          lt: firstDayNextMonth
        }
      },
      select: { amount: true }
    });
    const totalIncome = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const allExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: firstDayOfMonth,
          lt: firstDayNextMonth
        }
      },
      select: { amount: true }
    });
    const totalExpense = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

    // 4. Последние проекты
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        cost: true,
        address: true,
        deadline: true,
        createdAt: true
      }
    });

    // 5. Последние финансовые операции
    const recentTransactions = await prisma.projectTransaction.findMany({
      take: 8,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        date: true,
        comment: true,
        project: {
          select: { name: true }
        }
      }
    });

    // 6. Последние расходы
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        date: true,
        purpose: true,
        category: true
      }
    });

    const totalWarehouseValue = await prisma.warehouseItem.aggregate({
      _sum: { cost: true }
    });

    // 8. Бригады
    const totalBrigades = await prisma.brigade.count();
    const activeBrigades = await prisma.brigade.count({
      where: {
        projects: {
          some: {}
        }
      }
    });

    // 9. Графики выплат (последние 7 дней)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const salaryReports = await prisma.salaryReport.findMany({
      where: {
        date: {
          gte: last7Days
        }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        totalAmount: true
      }
    });

    const salaryChartData = salaryReports.map(report => ({
      date: report.date.toISOString().split('T')[0],
      amount: report.totalAmount
    }));

    // 10. Статусы проектов
    const projectStatuses = await prisma.project.groupBy({
      by: ['status'],
      _count: true
    });

    const statusChartData = projectStatuses.map(status => ({
      name: status.status,
      count: status._count
    }));

    // 11. Расходы по категориям
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      orderBy: {
        _sum: { amount: 'desc' }
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          pausedProjects,
          completedProjects,
          overdueProjects,
          upcomingDeadlines,
          totalEmployees,
          employeesToday,
          avgProjectCost,
          balance,
          totalIncome,
          totalExpense,
          profitMargin,
          totalBrigades,
          activeBrigades,
          totalWarehouseValue
        },
        recentProjects,
        recentTransactions: recentTransactions || [],
        recentExpenses: recentExpenses || [],
        salaryChartData,
        statusChartData,
        expensesByCategory
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
