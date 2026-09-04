import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Проекты
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({
      where: { status: 'в работе' }
    });
    const totalProjectCost = await prisma.project.aggregate({
      _sum: { cost: true }
    });
    const avgProjectCost = totalProjects > 0 
      ? Math.round((totalProjectCost._sum.cost || 0) / totalProjects)
      : 0;

    // 2. Сотрудники
    const totalEmployees = await prisma.employee.count();
    
    // 3. Сегодня на смене (сотрудники с записями в графике за сегодня)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

    // 4. Финансы (используем ProjectTransaction)
    const allTransactions = await prisma.projectTransaction.findMany({
      select: { amount: true }
    });
    const totalIncome = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = 0; // Пока нет разделения на доходы/расходы
    const balance = totalIncome;

    // 5. Последние проекты
    const recentProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        cost: true,
        address: true,
        createdAt: true
      }
    });

    // 6. Последние финансовые операции
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

    // 6.1 Материалы на складе (для общей стоимости)
    const warehouseValueResult = await prisma.warehouseItem.aggregate({
      _sum: { cost: true }
    });
    const totalWarehouseValue = warehouseValueResult._sum.cost || 0;

    // 7. Бригады
    const totalBrigades = await prisma.brigade.count();
    const activeBrigades = await prisma.brigade.count({
      where: {
        projects: {
          some: {}
        }
      }
    });

    // 8. Графики выплат (последние 7 дней)
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

    // 9. Статусы проектов
    const projectStatuses = await prisma.project.groupBy({
      by: ['status'],
      _count: true
    });

    const statusChartData = projectStatuses.map(status => ({
      name: status.status,
      count: status._count
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          totalEmployees,
          employeesToday,
          avgProjectCost,
          balance,
          totalIncome,
          totalExpense,
          totalBrigades,
          activeBrigades,
          totalWarehouseValue
        },
        recentProjects,
        recentTransactions: recentTransactions || [],
        salaryChartData,
        statusChartData
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
