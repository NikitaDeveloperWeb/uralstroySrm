'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Loader2, Pencil, Trash2, Search, Calendar, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { FinanceCards } from '@/shared/components/finance/FinanceCards';
import { AdvanceReportCombinedModal } from '@/shared/components/finance/AdvanceReportCombinedModal';
import { SalaryReportModal } from '@/shared/components/finance/SalaryReportModal';
import { SalaryReportViewModal } from '@/shared/components/finance/SalaryReportViewModal';
import { PenaltyModal } from '@/shared/components/finance/PenaltyModal';
import { BonusModal } from '@/shared/components/finance/BonusModal';
import { AddIncomeModal } from '@/shared/components/finance/AddIncomeModal';
import { IncomeReportModal } from '@/shared/components/finance/IncomeReportModal';
import type { Project } from '@/shared/types/project';
import { AddExpenseModal } from '@/shared/components/finance/AddExpenseModal';
import { ExpenseReportModal } from '@/shared/components/finance/ExpenseReportModal';
import { FundManagementModal } from '@/shared/components/finance/FundManagementModal';
import { SummaryReportModal } from '@/shared/components/finance/SummaryReportModal';
import { EmployeeAdvanceModal } from '@/shared/components/finance/EmployeeAdvanceModal';
import { useFinanceStore } from '@/shared/stores/financeStore';
import { useFundStore } from '@/shared/stores/fundStore';
import { useAlert } from '@/shared/hooks/useAlert';


type ModalType = 'salary' | 'daily-earning' | 'funds' | 'salary-view' | null;

interface Expense {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
  createdAt: string;
}

interface Fund {
  id: string;
  name: string;
  type: string;
  balance: number;
  targetAmount: number;
  description: string;
  createdAt: string;
}

interface FundFormData {
  name: string;
  type: string;
  targetAmount: number;
  description: string;
}

interface FundTransaction {
  id: string;
  fundId: string;
  fundName: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface FinanceReportEntry {
  id: string;
  type: 'object' | 'advance' | 'salary' | 'daily-expense' | 'daily-earning';
  date: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface EmployeeWorkReportEntry {
  id: string;
  employeeName: string;
  hours: number;
  rate: number;
  date: string;
  completedJobs: number;
}

interface EOTItem {
  id: string;
  employeeName: string;
  paymentType: string;
  hours?: number;
  quantity?: number;
  rate?: number;
  workAmount?: number;
  salary: number;
}

interface EOTReport {
  id: string;
  date: string;
  items: EOTItem[];
  totalAmount: number;
}

export default function FinancePage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [showFundManagement, setShowFundManagement] = useState(false);
  const [expenseCategoriesTab, setExpenseCategoriesTab] = useState(false);

  // Expense categories state
  const [expenseCategories, setExpenseCategories] = useState<{ id: number; name: string; createdAt: string; updatedAt: string }[]>([]);
  const [expenseCategoriesLoading, setExpenseCategoriesLoading] = useState(true);
  const [expenseCategoriesModalOpen, setExpenseCategoriesModalOpen] = useState(false);
  const [editingExpenseCategory, setEditingExpenseCategory] = useState<{ id: number; name: string; createdAt: string; updatedAt: string } | null>(null);
  const expenseCategoryNameRef = useRef<HTMLInputElement>(null);
  const [expenseCategoriesSearch, setExpenseCategoriesSearch] = useState('');
  const [expenseCategoriesPage, setExpenseCategoriesPage] = useState(1);
  const expenseCategoriesPerPage = 12;
  
  const { expenses, advanceReports, salaryReports, fetchExpenses, addExpense, addAdvanceReport, addSalaryReport, fetchAdvanceReports, fetchSalaryReports } = useFinanceStore();
  const { funds, fetchFunds, createFund, updateFund, deleteFund, createTransaction } = useFundStore();
  const [showExpenseReport, setShowExpenseReport] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showIncomeReport, setShowIncomeReport] = useState(false);
  const [showAdvanceCombined, setShowAdvanceCombined] = useState(false);
  const [showSalaryView, setShowSalaryView] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEOTView, setShowEOTView] = useState(false);
  const [showEmployeeAdvance, setShowEmployeeAdvance] = useState(false);
  const [todayIncome, setTodayIncome] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);

  const today = new Date().toISOString().split('T')[0];

  // EOT state
  const [eotReports, setEotReports] = useState<EOTReport[]>([]);
  const [eotDate, setEotDate] = useState(today);
  const [eotGenerating, setEotGenerating] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState<number | null>(null);
  const [eotPage, setEotPage] = useState(1);
  const EOT_PER_PAGE = 10;
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const todayExpenses = expenses.filter(e => e.date.startsWith(today)).reduce((sum, e) => sum + e.amount, 0);
  const totalBalance = funds.reduce((sum, f) => sum + f.balance, 0);
  const { alert, confirm } = useAlert();

  useEffect(() => {
    fetchExpenses({ date: today });
    fetchAdvanceReports();
    fetchSalaryReports();
    fetchFunds();
    fetch(`/api/transactions-summary?date=${today}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setTodayIncome(data.data.totalAmount || 0);
        }
      })
      .catch(() => setTodayIncome(0));
    loadProjects();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  // Debug salary reports
  useEffect(() => {
    console.log('salaryReports from store:', salaryReports);
  }, [salaryReports]);

  // Load expense categories
  useEffect(() => {
    fetch('/api/expense-categories')
      .then(res => res.json())
      .then(data => setExpenseCategories(data?.data || []))
      .catch(err => console.error('Failed to fetch categories:', err))
      .finally(() => setExpenseCategoriesLoading(false));
  }, []);

  // Expense categories handlers
  const filteredExpenseCategories = expenseCategories.filter(cat =>
    cat.name.toLowerCase().includes(expenseCategoriesSearch.toLowerCase())
  );

  const expenseCategoriesTotalPages = Math.ceil(filteredExpenseCategories.length / expenseCategoriesPerPage);
  const paginatedExpenseCategories = filteredExpenseCategories.slice(
    (expenseCategoriesPage - 1) * expenseCategoriesPerPage,
    expenseCategoriesPage * expenseCategoriesPerPage
  );

  useEffect(() => {
    setExpenseCategoriesPage(1);
  }, [expenseCategoriesSearch]);

  const handleDeleteExpenseCategory = async (id: number) => {
    if (!(await confirm('Удалить эту категорию?'))) return;
    try {
      await fetch(`/api/expense-categories/${id}`, { method: 'DELETE' });
      setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAddExpenseCategory = () => {
    setEditingExpenseCategory(null);
    setExpenseCategoriesModalOpen(true);
    setTimeout(() => {
      if (expenseCategoryNameRef.current) expenseCategoryNameRef.current.value = '';
    }, 0);
  };

  const handleEditExpenseCategory = (category: { id: number; name: string; createdAt: string; updatedAt: string }) => {
    setEditingExpenseCategory(category);
    setExpenseCategoriesModalOpen(true);
    setTimeout(() => {
      if (expenseCategoryNameRef.current) expenseCategoryNameRef.current.value = category.name;
    }, 0);
  };

  const handleSaveExpenseCategory = async () => {
    try {
      const name = expenseCategoryNameRef.current?.value?.trim() || '';

      if (!name) {
        alert('Укажите название');
        return;
      }

      if (editingExpenseCategory) {
        await fetch(`/api/expense-categories/${editingExpenseCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        setExpenseCategories(prev => prev.map(cat =>
          cat.id === editingExpenseCategory.id ? { ...cat, name } : cat
        ));
      } else {
        const res = await fetch('/api/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const newCategory = await res.json();
        setExpenseCategories(prev => [...prev, newCategory.data]);
      }
      setExpenseCategoriesModalOpen(false);
      setEditingExpenseCategory(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };



  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleIncomeSuccess = async () => {
    await loadProjects();
    await fetchExpenses({ date: today });
  };

  const handleGenerateEOT = async () => {
    setEotGenerating(true);
    try {
      // Создаем отчет за выбранную дату
      const res = await fetch('/api/eot-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: eotDate }),
      });
      const data = await res.json();
      if (data.success) {
        // После генерации загружаем все отчеты
        const listRes = await fetch('/api/eot-reports');
        const listData = await listRes.json();
        if (listData.success) {
          setEotReports(listData.data || []);
          setShowEOTView(true);
        }
      } else {
        console.error('Error generating EOT:', data.error);
      }
    } catch (error) {
      console.error('Error generating EOT:', error);
    } finally {
      setEotGenerating(false);
    }
  };

  const handleRefreshEOT = async (reportId: number) => {
    setUpdatingReportId(reportId);
    try {
      const res = await fetch(`/api/eot-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setEotReports(prev => prev.map(r => String(r.id) === String(reportId) ? data.data : r));
      }
    } catch (error) {
      console.error('Error refreshing EOT:', error);
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleRefreshAllEOT = async () => {
    setUpdatingReportId(-1);
    try {
      await handleGenerateEOT();
    } finally {
      setUpdatingReportId(null);
    }
  };

  const toggleMonth = (monthName: string) => {
    setCollapsedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthName)) {
        newSet.delete(monthName);
      } else {
        newSet.add(monthName);
      }
      return newSet;
    });
  };

  const eotTotalPages = Math.ceil(eotReports.length / EOT_PER_PAGE);
  const paginatedEOTReports = eotReports.slice(
    (eotPage - 1) * EOT_PER_PAGE,
    eotPage * EOT_PER_PAGE
  );

  const handleAdvanceReportSubmit = async (data: {
    date: string;
    entries: Array<{ employeeId: number; employeeName: string; amount: string; purpose: string }>;
  }) => {
    await addAdvanceReport({ date: data.date, entries: data.entries });
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    await addExpense(expense);
  };

  const handleDeleteAdvanceReport = async (id: number) => {
    try {
      await fetch(`/api/advance-reports/${id}`, { method: 'DELETE' });
      await fetchAdvanceReports();
    } catch (error) {
      console.error('Error deleting advance report:', error);
    }
  };

  const handleFundOperation = async (data: {
    fundId: number;
    type: 'income' | 'expense';
    amount: number;
    description?: string;
    date: string;
  }) => {
    try {
      await createTransaction(data);
    } catch (error: any) {
      alert(error.message || 'Ошибка при создании транзакции');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Финансы</h1>
      </div>

      <FinanceCards
        todayExpenses={todayExpenses}
        totalBalance={totalBalance}
        todayIncome={todayIncome}
        onAddExpense={() => setShowAddExpense(true)}
        onAddIncome={() => setShowIncomeModal(true)}
        onViewExpenseReport={() => setShowExpenseReport(true)}
        onViewAdvance={() => setShowAdvanceCombined(true)}
        onViewSalary={() => setActiveModal('salary')}
        onViewEarnings={() => setShowIncomeReport(true)}
        onViewPenalty={() => setShowPenaltyModal(true)}
        onViewBonus={() => setShowBonusModal(true)}
        onViewSummary={() => setShowSummaryModal(true)}
        onViewEOT={() => handleGenerateEOT()}
        onViewEmployeeAdvance={() => setShowEmployeeAdvance(true)}
        onManageFunds={() => setShowFundManagement(true)}
      />

      {/* Вкладка Категории расходов */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpenseCategoriesTab(!expenseCategoriesTab)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            expenseCategoriesTab
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 7h.01M7 7h.01M17 7h.01M17 7h.01M17 7h.01M7 12h.01M7 12h.01M7 12h.01M17 12h.01M17 12h.01M17 12h.01M7 17h.01M7 17h.01M7 17h.01M17 17h.01M17 17h.01M17 17h.01" />
          </svg>
          Категории расходов ({expenseCategories.length})
        </button>
      </div>

      {expenseCategoriesTab && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white">Категории расходов</h2>
            <button
              onClick={handleAddExpenseCategory}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить категорию
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={expenseCategoriesSearch}
              onChange={(e) => setExpenseCategoriesSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {expenseCategoriesLoading ? (
              <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название</th>
                      <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExpenseCategories.map((category) => (
                      <tr key={category.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                        <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{category.name}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditExpenseCategory(category)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpenseCategory(category.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {filteredExpenseCategories.length > 0 && (
            <Pagination
              currentPage={expenseCategoriesPage}
              totalPages={expenseCategoriesTotalPages}
              onPageChange={setExpenseCategoriesPage}
              totalItems={filteredExpenseCategories.length}
              itemsPerPage={expenseCategoriesPerPage}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <AdvanceReportCombinedModal
        isOpen={showAdvanceCombined}
        onClose={() => setShowAdvanceCombined(false)}
        onSubmit={handleAdvanceReportSubmit}
        reports={advanceReports}
        onDelete={handleDeleteAdvanceReport}
      />

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSubmit={handleAddExpense}
      />

      <ExpenseReportModal
        isOpen={showExpenseReport}
        onClose={() => setShowExpenseReport(false)}
      />

      <AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        projects={projects}
        onSuccess={handleIncomeSuccess}
      />

      <IncomeReportModal
        isOpen={showIncomeReport}
        onClose={() => setShowIncomeReport(false)}
      />
      <SalaryReportModal
        isOpen={activeModal === 'salary'}
        onClose={() => setActiveModal(null)}
        onRefresh={fetchSalaryReports}
        reports={salaryReports}
      />

      <PenaltyModal
        isOpen={showPenaltyModal}
        onClose={() => setShowPenaltyModal(false)}
      />

      <BonusModal
        isOpen={showBonusModal}
        onClose={() => setShowBonusModal(false)}
      />

      <SalaryReportViewModal
        isOpen={showSalaryView}
        onClose={() => setShowSalaryView(false)}
        reports={salaryReports}
        onDelete={async () => {}}
        onUpdateStatus={async () => {}}
      />



      {/* EOT Section */}
      {showEOTView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-xl w-[85vw] md:w-[85vw] lg:w-[90vw] max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Единый отчет об оплате труда (ЕОТ)</h2>
              <button
                onClick={() => setShowEOTView(false)}
                className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
                <input
                  type="date"
                  value={eotDate}
                  onChange={e => setEotDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
              <button
                onClick={handleRefreshAllEOT}
                disabled={updatingReportId === -1}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {updatingReportId === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
                Обновить все
              </button>
              <button
                onClick={handleGenerateEOT}
                disabled={eotGenerating}
                className="bg-[#1976d2] hover:bg-[#1565c0] disabled:bg-gray-400 dark:bg-slate-600 dark:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {eotGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {eotGenerating ? 'Генерация...' : 'Сгенерировать ЕОТ'}
              </button>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              {eotReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400">Нет сгенерированных отчетов</p>
                </div>
              ) : (
                (() => {
                  const monthsMap = new Map();
                  paginatedEOTReports.forEach(report => {
                    const date = new Date(report.date);
                    const monthKey = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                    if (!monthsMap.has(monthKey)) monthsMap.set(monthKey, []);
                    monthsMap.get(monthKey).push(report);
                  });

                  return Array.from(monthsMap.entries()).map(([monthName, reports]) => {
                    const isCollapsed = collapsedMonths.has(monthName);
                    return (
                      <div key={monthName} className="mb-8">
                        <div 
                          className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleMonth(monthName)}
                        >
                          <div>
                            <p className="text-lg font-bold text-blue-800 capitalize">{monthName}</p>
                            <p className="text-sm text-blue-600">Отчетов: {reports.length}</p>
                          </div>
                          <span className="text-blue-600">{isCollapsed ? '▼' : '▲'}</span>
                        </div>
                        {!isCollapsed && (
                          <div className="space-y-4">
                            {paginatedEOTReports.map((report: EOTReport) => (
                              <div key={report.id} className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg">
                            <div className="bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 px-4 py-3 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white dark:text-white">Отчет от {new Date(report.date).toLocaleDateString('ru-RU')}</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">Сотрудников: {report.items.length}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRefreshEOT(Number(report.id))}
                                  disabled={updatingReportId === Number(report.id)}
                                  className="text-orange-600 hover:text-orange-800 transition-colors p-1.5 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                                  title="Обновить отчет"
                                >
                                  {updatingReportId === Number(report.id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Loader2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    const wb = XLSX.utils.book_new();
                                    const rows: string[][] = [
                                      ['Единый отчет об оплате труда (ЕОТ)'],
                                      ['Дата', new Date(report.date).toLocaleDateString('ru-RU')],
                                      ['Сотрудников', String(report.items.length)],
                                      ['Общая сумма', report.totalAmount.toLocaleString('ru-RU') + ' ₽'],
                                      [],
                                      ['Сотрудник', 'Тип оплаты', 'Часы/м²', 'Ставка', 'Сумма', 'Зарплата'],
                                    ];
                                    report.items.forEach(item => {
                                      rows.push([
                                        item.employeeName,
                                        item.paymentType,
                                        item.hours ? item.hours + ' ч' : item.quantity ? item.quantity + ' м²' : '—',
                                        item.rate ? item.rate.toLocaleString('ru-RU') + ' ₽' : '—',
                                        item.workAmount ? item.workAmount.toLocaleString('ru-RU') + ' ₽' : '—',
                                        item.salary.toLocaleString('ru-RU') + ' ₽',
                                      ]);
                                    });
                                    const ws = XLSX.utils.aoa_to_sheet(rows);
                                    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
                                    XLSX.utils.book_append_sheet(wb, ws, 'ЕОТ #' + report.id);
                                    XLSX.writeFile(wb, 'eot_' + report.id + '_' + report.date + '.xlsx');
                                  }}
                                  className="text-green-600 hover:text-green-800 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
                                  title="Экспорт в Excel"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <p className="text-lg font-bold text-green-600">{report.totalAmount.toLocaleString('ru-RU')} ₽</p>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Сотрудник</th>
                                    <th className="text-left py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Тип оплаты</th>
                                    <th className="text-right py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Часы/м²</th>
                                    <th className="text-right py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Ставка</th>
                                    <th className="text-right py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Сумма</th>
                                    <th className="text-right py-3 px-4 text-gray-500 dark:text-slate-400 dark:text-slate-400">Зарплата</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {report.items.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700">
                                      <td className="py-2 px-4">{item.employeeName}</td>
                                      <td className="py-2 px-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                          item.paymentType.includes('сдель') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                          {item.paymentType}
                                        </span>
                                      </td>
                                      <td className="text-right py-2 px-4">
                                        {item.hours ? item.hours + ' ч' : item.quantity ? item.quantity + ' м²' : '—'}
                                      </td>
                                      <td className="text-right py-2 px-4">
                                        {item.rate ? item.rate.toLocaleString('ru-RU') + ' ₽' : '—'}
                                      </td>
                                      <td className="text-right py-2 px-4">
                                        {item.workAmount ? item.workAmount.toLocaleString('ru-RU') + ' ₽' : '—'}
                                      </td>
                                      <td className="text-right py-2 px-4 font-semibold text-green-600">
                                        {item.salary.toLocaleString('ru-RU')} ₽
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {eotReports.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-slate-700 dark:border-slate-700">
                <Pagination
                  currentPage={eotPage}
                  totalPages={eotTotalPages}
                  onPageChange={setEotPage}
                  totalItems={eotReports.length}
                  itemsPerPage={EOT_PER_PAGE}
                />
              </div>
            )}

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setShowEOTView(false)}
                className="bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fund Modals */}
      <SummaryReportModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
      />

      <EmployeeAdvanceModal
        isOpen={showEmployeeAdvance}
        onClose={() => setShowEmployeeAdvance(false)}
      />

      <FundManagementModal
        isOpen={showFundManagement}
        onClose={() => setShowFundManagement(false)}
        funds={funds.map(f => ({
          id: f.id.toString(),
          name: f.name,
          type: 'bonus',
          balance: f.balance,
          targetAmount: 0,
          description: f.description || '',
          createdAt: f.createdAt,
        }))}
        fundTransactions={funds.map(f => f.transactions.map(t => ({
          id: t.id.toString(),
          fundId: f.id.toString(),
          fundName: f.name,
          type: t.type as 'income' | 'expense',
          amount: t.amount,
          description: t.description || '',
          date: t.date,
        }))).flat()}
        onEditFund={() => alert('Редактирование фонда')}
        onDeleteFund={async (id) => {
          if (await confirm('Удалить этот фонд?')) {
            await deleteFund(Number(id));
          }
        }}
        onOperation={() => {
          // Operation is handled inside the modal
        }}
        onCreateModal={() => alert('Создание нового фонда')}
      />

      {/* Модальное окно категорий расходов */}
      <Modal
        isOpen={expenseCategoriesModalOpen}
        onClose={() => { setExpenseCategoriesModalOpen(false); setEditingExpenseCategory(null); }}
        title={editingExpenseCategory ? 'Редактировать категорию' : 'Новая категория'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название</label>
            <input ref={expenseCategoryNameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Бензин/ГСМ" />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveExpenseCategory}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setExpenseCategoriesModalOpen(false); setEditingExpenseCategory(null); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
