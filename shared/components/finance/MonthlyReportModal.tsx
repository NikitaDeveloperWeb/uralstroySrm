'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Users, Building2, Wallet, TrendingUp, TrendingDown, Package, Truck, Award, AlertTriangle, HandCoins, FileText, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MonthlyReport {
  period: {
    year: number;
    month: number;
    monthName: string;
  };
  employees: {
    total: number;
    active: number;
    newThisMonth: number;
    totalBonuses: number;
    totalPenalties: number;
    bonusCount: number;
    penaltyCount: number;
    activeAdvances: number;
    advanceCount: number;
  };
  projects: {
    total: number;
    active: number;
    completedThisMonth: number;
    newThisMonth: number;
  };
  finances: {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
    profitMargin: number;
  };
  salary: {
    total: number;
    reportsCount: number;
  };
  expenses: {
    byCategory: Array<{ name: string; count: number; amount: number }>;
    byProject: Array<{ name: string; count: number; amount: number }>;
  };
  suppliers: {
    total: number;
    totalDebt: number;
    paymentsThisMonth: number;
    details: Array<{
      id: number;
      name: string;
      received: number;
      paid: number;
      balance: number;
      debt: number;
    }>;
  };
  warehouse: {
    items: number;
    totalValue: number;
    movementsIn: number;
    movementsOut: number;
  };
  incomeByProject: Array<{ name: string; income: number; cost: number }>;
}

export function MonthlyReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const reportRef = useRef<HTMLDivElement>(null);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const years = [2023, 2024, 2025, 2026];

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen, selectedYear, selectedMonth]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summary-reports/monthly?year=${selectedYear}&month=${selectedMonth}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!report) return;

    const wb = XLSX.utils.book_new();

    // Лист 1: Общая сводка
    const summaryData = [
      ['ОБЩИЙ ЕЖЕМЕСЯЧНЫЙ ОТЧЕТ'],
      ['Период:', report.period.monthName + ' ' + report.period.year],
      [],
      ['СОТРУДНИКИ'],
      ['Всего в штате', report.employees.total],
      ['Активных', report.employees.active],
      ['Новых в этом месяце', report.employees.newThisMonth],
      [],
      ['ПРЕМИИ И ШТРАФЫ'],
      ['Количество премий', report.employees.bonusCount],
      ['Сумма премий', report.employees.totalBonuses],
      ['Количество штрафов', report.employees.penaltyCount],
      ['Сумма штрафов', report.employees.totalPenalties],
      [],
      ['ПОДОТЧЕТНЫЕ'],
      ['Активных подотчетов', report.employees.advanceCount],
      ['Сумма подотчетов', report.employees.activeAdvances],
      [],
      ['ПРОЕКТЫ'],
      ['Всего проектов', report.projects.total],
      ['Активных', report.projects.active],
      ['Новых в этом месяце', report.projects.newThisMonth],
      ['Завершено в этом месяце', report.projects.completedThisMonth],
      [],
      ['ФИНАНСЫ'],
      ['Общие доходы', report.finances.totalIncome],
      ['Расходы (материалы, бензин, прочее)', report.finances.totalExpenses],
      ['Зарплаты (ЕОТ)', report.salary.total],
      ['Прибыль (доходы - расходы - зарплаты)', report.finances.profit],
      ['Рентабельность %', report.finances.profitMargin.toFixed(1) + '%'],
      [],
      ['ПОСТАВЩИКИ'],
      ['Всего поставщиков', report.suppliers.total],
      ['Долг перед поставщиками', report.suppliers.totalDebt],
      ['Оплачено в этом месяце', report.suppliers.paymentsThisMonth],
      [],
      ['СКЛАД'],
      ['Позиций на складе', report.warehouse.items],
      ['Общая стоимость', report.warehouse.totalValue],
      ['Приход', report.warehouse.movementsIn],
      ['Расход', report.warehouse.movementsOut],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Общая сводка');

    // Лист 2: Расходы по категориям
    const categoryData = [['РАСХОДЫ ПО КАТЕГОРИЯМ'], ['Категория', 'Количество', 'Сумма']];
    report.expenses.byCategory.forEach(cat => {
      categoryData.push([cat.name, cat.count.toString(), cat.amount.toString()]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(categoryData);
    ws2['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Расходы по категориям');

    // Лист 3: Расходы по проектам
    const projectData = [['РАСХОДЫ ПО ПРОЕКТАМ'], ['Проект', 'Количество', 'Сумма']];
    report.expenses.byProject.forEach(proj => {
      projectData.push([proj.name, proj.count.toString(), proj.amount.toString()]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(projectData);
    ws3['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Расходы по проектам');

    // Лист 4: Доходы по проектам
    const incomeData = [['ДОХОДЫ ПО ПРОЕКТАМ'], ['Проект', 'Доход', 'Стоимость проекта']];
    report.incomeByProject.forEach(proj => {
      incomeData.push([proj.name, proj.income.toString(), proj.cost.toString()]);
    });
    const ws4 = XLSX.utils.aoa_to_sheet(incomeData);
    ws4['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Доходы по проектам');

    XLSX.writeFile(wb, `Ежемесячный_отчет_${report.period.monthName}_${report.period.year}.xlsx`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[95vw] md:w-[95vw] lg:w-[95vw] h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#1976d2]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Общий ежемесячный отчет</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              disabled={!report || loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Экспорт Excel
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-4 flex-shrink-0 bg-gray-50 dark:bg-slate-700">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Период:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white"
          >
            {months.map((month, idx) => (
              <option key={idx} value={idx + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-600 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {report && (
            <span className="text-lg font-bold text-[#1976d2] ml-auto">
              {report.period.monthName} {report.period.year}
            </span>
          )}
        </div>

        {/* Content */}
        <div ref={reportRef} className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-slate-400 text-lg">Генерация отчета...</div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Ключевые показатели */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-700 rounded-lg p-6 border border-blue-100 dark:border-slate-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Ключевые показатели</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Доходы</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(report.finances.totalIncome)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Расходы (материалы + прочее)</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(report.finances.totalExpenses)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">Прибыль</span>
                    </div>
                    <p className={`text-2xl font-bold ${report.finances.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(report.finances.profit)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Доходы - Расходы - Зарплаты
                    </p>
                  </div>
                </div>
              </div>

              {/* Сотрудники */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Сотрудники</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Всего в штате</p>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{report.employees.total}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Новых в этом месяце</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{report.employees.newThisMonth}</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-yellow-600" />
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">Премии</p>
                    </div>
                    <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{report.employees.bonusCount} шт.</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">{formatCurrency(report.employees.totalBonuses)}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-600 dark:text-red-400">Штрафы</p>
                    </div>
                    <p className="text-xl font-bold text-red-700 dark:text-red-300">{report.employees.penaltyCount} шт.</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{formatCurrency(report.employees.totalPenalties)}</p>
                  </div>
                </div>
                {report.employees.advanceCount > 0 && (
                  <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <HandCoins className="w-5 h-5 text-orange-600" />
                      <p className="font-semibold text-orange-700 dark:text-orange-300">Активные подотчеты</p>
                    </div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {report.employees.advanceCount} шт. на сумму {formatCurrency(report.employees.activeAdvances)}
                    </p>
                  </div>
                )}
              </div>

              {/* Проекты */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Проекты</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Всего проектов</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{report.projects.total}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Активных</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{report.projects.active}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Новых в этом месяце</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{report.projects.newThisMonth}</p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                    <p className="text-sm text-teal-600 dark:text-teal-400 mb-1">Завершено</p>
                    <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">{report.projects.completedThisMonth}</p>
                  </div>
                </div>

                {/* Доходы по проектам */}
                {report.incomeByProject.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Доходы по проектам:</h4>
                    <div className="space-y-2">
                      {report.incomeByProject.slice(0, 5).map((proj, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{proj.name}</span>
                          <span className="font-semibold text-green-600">{formatCurrency(proj.income)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Финансы детально */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Финансы детально</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Расходы по категориям:</h4>
                    <div className="space-y-2">
                      {report.expenses.byCategory.map((cat, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{cat.name} ({cat.count})</span>
                          <span className="font-semibold text-red-600">{formatCurrency(cat.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-2">Расходы по проектам:</h4>
                    <div className="space-y-2">
                      {report.expenses.byProject.map((proj, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-slate-300">{proj.name} ({proj.count})</span>
                          <span className="font-semibold text-red-600">{formatCurrency(proj.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Поставщики */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Поставщики</h3>
                </div>
                
                {/* Общая сводка */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Всего поставщиков</p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{report.suppliers.total}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">Долг перед поставщиками</p>
                    <p className="text-3xl font-bold text-red-700 dark:text-red-300">{formatCurrency(report.suppliers.totalDebt)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Оплачено в этом месяце</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatCurrency(report.suppliers.paymentsThisMonth)}</p>
                  </div>
                </div>

                {/* Детализация по поставщикам */}
                {report.suppliers.details && report.suppliers.details.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-slate-200 mb-3">Детализация:</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {report.suppliers.details.map((supplier) => (
                        <div key={supplier.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-gray-50 dark:bg-slate-700">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-bold text-gray-900 dark:text-white">{supplier.name}</h5>
                            {supplier.debt > 0 && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                                Долг: {formatCurrency(supplier.debt)}
                              </span>
                            )}
                            {supplier.balance < 0 && (
                              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                Переплата: {formatCurrency(Math.abs(supplier.balance))}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-slate-400 text-xs">Забрано материалов</p>
                              <p className="font-semibold text-green-600">+{formatCurrency(supplier.received)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-slate-400 text-xs">Оплачено</p>
                              <p className="font-semibold text-red-600">-{formatCurrency(supplier.paid)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Склад */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Склад</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Позиций на складе</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{report.warehouse.items}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Общая стоимость</p>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(report.warehouse.totalValue)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Приход за месяц</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatCurrency(report.warehouse.movementsIn)}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">Расход за месяц</p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(report.warehouse.movementsOut)}</p>
                  </div>
                </div>
              </div>

              {/* Зарплаты */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Зарплаты (ЕОТ)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Отчетов ЕОТ</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{report.salary.reportsCount}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Выплачено всего</p>
                    <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(report.salary.total)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-slate-400 text-lg">Выберите период для формирования отчета</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
