import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/shared/lib/api-response';

// GET /api/summary-reports/monthly - общий ежемесячный отчет
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;

    // Дата начала и конца месяца
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. СОТРУДНИКИ
    const [
      totalEmployees,
      activeEmployees,
      newEmployees,
      bonuses,
      penalties,
      employeeAdvances,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { hireDate: { lte: monthEnd } } }),
      prisma.employee.count({
        where: {
          hireDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.bonus.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: { employee: true },
      }),
      prisma.penalty.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: { employee: true },
      }),
      prisma.employeeAdvance.findMany({
        where: {
          status: 'active',
        },
      }),
    ]);

    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalPenalties = penalties.reduce((sum, p) => sum + p.amount, 0);
    const activeAdvances = employeeAdvances.reduce((sum, a) => sum + a.amount, 0);

    // 2. ПРОЕКТЫ
    const [
      totalProjects,
      activeProjects,
      completedThisMonthCount,
      newProjects,
      allProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: { not: 'завершен' } } }),
      prisma.project.count({
        where: {
          status: 'завершен',
          updatedAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.project.findMany({
        include: {
          transactions: true,
          materials: true,
          overheads: true,
        },
      }),
    ]);

    // 3. ФИНАНСЫ - ПРИХОДЫ (все транзакции по проектам за месяц)
    const allTransactions = allProjects.flatMap(p => p.transactions);
    const monthTransactions = allTransactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    const totalIncome = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Проверяем, есть ли другие доходы (например, через expense с отрицательной суммой)
    const allExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    console.log('ВСЕХ расходов за месяц:', allExpenses.length, 'на сумму:', allExpenses.reduce((s, e) => s + e.amount, 0));

    // 4. ФИНАНСЫ - РАСХОДЫ (только Expense за месяц)
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: { project: true },
    });
    
    console.log('ВСЕХ расходов за месяц:', expenses.length, 'на сумму:', expenses.reduce((s, e) => s + e.amount, 0));
    expenses.forEach(e => {
      console.log(`  - ${e.category}: ${e.amount} (${e.project?.name || 'Без проекта'})`);
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Исключаем зарплаты из расходов (они уже учтены в ЕОТ)
    const nonSalaryExpenses = expenses.filter(e => 
      e.category !== 'Зарплата' && 
      e.category !== 'Зарплаты' &&
      !e.category?.toLowerCase().includes('зарплата')
    );
    const totalExpensesOnly = nonSalaryExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Показываем что исключено
    const salaryExpenses = expenses.filter(e => 
      e.category === 'Зарплата' || 
      e.category === 'Зарплаты' ||
      e.category?.toLowerCase().includes('зарплата')
    );
    console.log('Исключено зарплат из expense:', salaryExpenses.length, 'на', salaryExpenses.reduce((s, e) => s + e.amount, 0));
    console.log('Категории расходов:', Object.entries(expenses.reduce((acc, e) => {
      acc[e.category || 'Без категории'] = (acc[e.category || 'Без категории'] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)).map(([k, v]) => `${k}: ${v}`).join(', '));

    // Расходы по категориям (исключая зарплаты)
    const expensesByCategory = nonSalaryExpenses.reduce((acc, e) => {
      const cat = e.category || 'Без категории';
      if (!acc[cat]) {
        acc[cat] = { count: 0, amount: 0 };
      }
      acc[cat].count += 1;
      acc[cat].amount += e.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // Расходы по проектам (исключая зарплаты)
    const expensesByProject = nonSalaryExpenses.reduce((acc, e) => {
      if (e.projectId) {
        const projectName = e.project?.name || `Проект #${e.projectId}`;
        if (!acc[projectName]) {
          acc[projectName] = { count: 0, amount: 0 };
        }
        acc[projectName].count += 1;
        acc[projectName].amount += e.amount;
      }
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    // 5. ПОСТАВЩИКИ - правильный расчет как в supplier-settlements
    const suppliers = await prisma.supplier.findMany();

    let totalSupplierDebt = 0;
    const supplierDebts = [];
    let monthSupplierPayments = 0;

    for (const supplier of suppliers) {
      // Материалы - из warehouseMovement
      const movements = await prisma.warehouseMovement.findMany({
        where: {
          supplierId: supplier.id,
          type: 'income',
        },
      });
      const totalReceived = movements.reduce((sum, m) => sum + (m.amount || 0), 0);

      // Платежи - из expense по supplierId
      const payments = await prisma.expense.findMany({
        where: {
          supplierId: supplier.id,
        },
      });
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

      const balance = totalReceived - totalPaid;
      const debt = balance > 0 ? balance : 0;
      totalSupplierDebt += debt;

      // Платежи ТОЛЬКО за месяц
      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate >= monthStart && pDate <= monthEnd;
      });
      monthSupplierPayments += monthPayments.reduce((sum, p) => sum + p.amount, 0);

      supplierDebts.push({
        id: supplier.id,
        name: supplier.companyName,
        received: totalReceived,
        paid: totalPaid,
        balance,
        debt,
      });
    }
    
    console.log('=== ДОЛГИ ПЕРЕД ПОСТАВЩИКАМИ ===');
    supplierDebts.forEach(sd => {
      console.log(`${sd.name}: получено ${sd.received}, оплачено ${sd.paid}, долг ${sd.debt}`);
    });
    console.log('ОБЩИЙ ДОЛГ:', totalSupplierDebt);
    const [warehouseItems, warehouseMovements] = await Promise.all([
      prisma.warehouseItem.findMany(),
      prisma.warehouseMovement.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
    ]);

    const totalWarehouseValue = warehouseItems.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
    const monthMovementsIn = warehouseMovements.filter(m => m.type === 'incoming').reduce((sum, m) => sum + (m.amount || 0), 0);
    const monthMovementsOut = warehouseMovements.filter(m => m.type === 'outgoing').reduce((sum, m) => sum + (m.amount || 0), 0);

    // 7. ЗАРПЛАТЫ (из EOT отчетов)
    const eotReports = await prisma.eOTReport.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const totalSalary = eotReports.reduce((sum, r) => sum + r.totalAmount, 0);

    // DEBUG: выводим данные для анализа
    console.log('=== ОТЧЕТ ЗА', month, year, '===');
    console.log('Доходы (транзакции):', totalIncome);
    console.log('Расходы (expense всего):', totalExpenses);
    console.log('Расходы без зарплат:', totalExpensesOnly);
    console.log('Зарплаты (ЕОТ):', totalSalary);
    console.log('Прибыль (формула):', totalIncome - totalExpensesOnly - totalSalary);
    console.log('Количество расходов:', expenses.length);
    console.log('Количество транзакций:', monthTransactions.length);

    // 8. ДОХОДЫ ПО ПРОЕКТАМ
    const incomeByProject = allProjects.map(p => {
      const projectTransactions = p.transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
      const income = projectTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        name: p.name,
        income,
        cost: p.cost || 0,
      };
    }).filter(p => p.income > 0);

    // Формируем ответ
    const report = {
      period: {
        year,
        month,
        monthName: monthStart.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newThisMonth: newEmployees,
        totalBonuses,
        totalPenalties,
        bonusCount: bonuses.length,
        penaltyCount: penalties.length,
        activeAdvances,
        advanceCount: employeeAdvances.length,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completedThisMonth: completedThisMonthCount,
        newThisMonth: newProjects,
      },
      finances: {
        totalIncome,
        totalExpenses: totalExpensesOnly,
        totalSalary,
        profit: totalIncome - totalExpensesOnly,  // Прибыль до вычета зарплат
        profitMargin: totalIncome > 0 ? ((totalIncome - totalExpensesOnly) / totalIncome * 100) : 0,
      },
      expenses: {
        byCategory: Object.entries(expensesByCategory).map(([name, data]) => ({
          name,
          ...data,
        })),
        byProject: Object.entries(expensesByProject).map(([name, data]) => ({
          name,
          ...data,
        })),
      },
      suppliers: {
        total: suppliers.length,
        totalDebt: totalSupplierDebt,
        paymentsThisMonth: monthSupplierPayments,
        details: supplierDebts,
      },
      warehouse: {
        items: warehouseItems.length,
        totalValue: totalWarehouseValue,
        movementsIn: monthMovementsIn,
        movementsOut: monthMovementsOut,
      },
      salary: {
        total: totalSalary,
        reportsCount: eotReports.length,
      },
      incomeByProject,
    };

    return successResponse(report);
  } catch (error) {
    console.error('GET /api/summary-reports/monthly error:', error);
    return errorResponse('Не удалось получить ежемесячный отчет', 500);
  }
}
