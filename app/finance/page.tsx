'use client';

import { useState, useEffect } from 'react';
import { Building2, Wallet, Users, ShoppingCart, Clock, PiggyBank } from 'lucide-react';
import { FinanceReportCard } from '@/shared/components/finance/FinanceReportCard';
import { ObjectReportModal } from '@/shared/components/finance/ObjectReportModal';
import { AdvanceReportModal } from '@/shared/components/finance/AdvanceReportModal';
import { SalaryReportModal } from '@/shared/components/finance/SalaryReportModal';
import { DailyExpenseReportModal } from '@/shared/components/finance/DailyExpenseReportModal';
import { DailyEarningsReportModal } from '@/shared/components/finance/DailyEarningsReportModal';
import { ReportsList } from '@/shared/components/finance/ReportsList';
import { FundCard } from '@/shared/components/finance/FundCard';
import { FundCreateModal } from '@/shared/components/finance/FundCreateModal';
import { FundOperationModal } from '@/shared/components/finance/FundOperationModal';
import { FundTransactions } from '@/shared/components/finance/FundTransactions';

type ModalType = 'object' | 'advance' | 'salary' | 'daily-expense' | 'daily-earning' | 'fund-create' | 'fund-operation' | 'funds' | null;

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

export default function FinancePage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'funds'>('reports');
  const [reports, setReports] = useState<FinanceReportEntry[]>([]);
  const [employeeWorkReports, setEmployeeWorkReports] = useState<EmployeeWorkReportEntry[]>([]);
  
  // Fund states
  const [funds, setFunds] = useState<Fund[]>([
    {
      id: 'fund-1',
      name: 'Фонд премирования',
      type: 'bonus',
      balance: 150000,
      targetAmount: 500000,
      description: 'Бонусы за выполнение плановых показателей',
      createdAt: '2026-01-01',
    },
    {
      id: 'fund-2',
      name: 'Фонд развития',
      type: 'development',
      balance: 300000,
      targetAmount: 1000000,
      description: 'Инвестиции в развитие компании',
      createdAt: '2026-01-01',
    },
  ]);
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>([
    {
      id: 'ft-1',
      fundId: 'fund-1',
      fundName: 'Фонд премирования',
      type: 'income',
      amount: 150000,
      description: 'Начальное пополнение фонда',
      date: '2026-01-01',
    },
    {
      id: 'ft-2',
      fundId: 'fund-2',
      fundName: 'Фонд развития',
      type: 'income',
      amount: 300000,
      description: 'Инвестиция в развитие',
      date: '2026-01-01',
    },
  ]);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [operationFund, setOperationFund] = useState<Fund | null>(null);
  const [operationType, setOperationType] = useState<'income' | 'expense'>('income');

  const handleObjectReportSubmit = (data: {
    objectName: string;
    type: 'income' | 'expense' | 'advance';
    amount: number;
    date: string;
    description: string;
    contractNumber: string;
  }) => {
    const newReport: FinanceReportEntry = {
      id: `obj-${Date.now()}`,
      type: 'object',
      date: data.date,
      amount: data.amount,
      description: `${data.description} (${data.contractNumber})`,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleAdvanceReportSubmit = (data: {
    employeeName: string;
    amount: number;
    date: string;
    purpose: string;
    status: 'pending' | 'paid' | 'returned';
  }) => {
    const newReport: FinanceReportEntry = {
      id: `adv-${Date.now()}`,
      type: 'advance',
      date: data.date,
      amount: data.amount,
      description: `${data.employeeName} — ${data.purpose}`,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleSalaryReportSubmit = (data: {
    employeeName: string;
    amount: number;
    period: string;
    paymentDate: string;
    status: 'pending' | 'paid';
  }) => {
    const newReport: FinanceReportEntry = {
      id: `sal-${Date.now()}`,
      type: 'salary',
      date: data.paymentDate,
      amount: data.amount,
      description: `${data.employeeName} — ${data.period}`,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleDailyExpenseSubmit = (data: {
    date: string;
    items: Array<{ category: string; amount: string; description: string }>;
    note: string;
  }) => {
    const total = data.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const newReport: FinanceReportEntry = {
      id: `exp-${Date.now()}`,
      type: 'daily-expense',
      date: data.date,
      amount: total,
      description: data.items.map((i) => `${i.description || i.category}`).join(', ') || data.note,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const handleDailyEarningsSubmit = (data: {
    date: string;
    employeeReports: EmployeeWorkReportEntry[];
  }) => {
    const total = data.employeeReports.reduce((sum, r) => sum + r.hours * r.rate, 0);
    const newReport: FinanceReportEntry = {
      id: `earn-${Date.now()}`,
      type: 'daily-earning',
      date: data.date,
      amount: total,
      description: data.employeeReports.map((r) => r.employeeName).join(', ') || '',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);

    setEmployeeWorkReports((prev) => [...prev, ...data.employeeReports]);
  };

  const handleDeleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  // Fund handlers
  const handleFundCreate = (fundData: FundFormData) => {
    const newFund: Fund = {
      ...fundData,
      id: `fund-${Date.now()}`,
      balance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFunds((prev) => [...prev, newFund]);
  };

  const handleFundEdit = (fundData: FundFormData) => {
    if (!editingFund) return;
    setFunds((prev) =>
      prev.map((f) =>
        f.id === editingFund.id ? { ...f, ...fundData } : f
      )
    );
    setEditingFund(null);
  };

  const handleFundDelete = (id: string) => {
    if (confirm('Удалить этот фонд? Все операции по фонду также будут удалены.')) {
      setFunds((prev) => prev.filter((f) => f.id !== id));
      setFundTransactions((prev) => prev.filter((t) => t.fundId !== id));
    }
  };

  const handleFundOperation = (data: {
    fundId: string;
    fundName: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
  }) => {
    const newTransaction: FundTransaction = {
      id: `ft-${Date.now()}`,
      fundId: data.fundId,
      fundName: data.fundName,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
    };
    setFundTransactions((prev) => [newTransaction, ...prev]);
    setFunds((prev) =>
      prev.map((f) =>
        f.id === data.fundId
          ? {
              ...f,
              balance: data.type === 'income' ? f.balance + data.amount : f.balance - data.amount,
            }
          : f
      )
    );
  };

  const cards = [
    {
      id: 'object-report',
      title: 'Отчет по объекту',
      description: 'Затраты на объект, предоплата, полная оплата, приход денег и авансы',
      icon: <Building2 className="w-5 h-5 text-[#1565c0]" />,
      color: 'bg-blue-50',
      accentColor: 'bg-blue-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Приход за месяц',
      statValue: '847 500 ₽',
      modalType: 'object' as ModalType,
    },
    {
      id: 'advance-report',
      title: 'Авансовый отчет',
      description: 'Кому, сколько и когда выдан аванс с деталями и статусами',
      icon: <Wallet className="w-5 h-5 text-[#2e7d32]" />,
      color: 'bg-green-50',
      accentColor: 'bg-green-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Невыданные авансы',
      statValue: '32 000 ₽',
      modalType: 'advance' as ModalType,
    },
    {
      id: 'salary-report',
      title: 'Зарплатный отчет',
      description: 'Зарплаты сотрудников: начисления, выплаты, остатки за период',
      icon: <Users className="w-5 h-5 text-[#7b1fa2]" />,
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Фонд оплаты',
      statValue: '415 200 ₽',
      modalType: 'salary' as ModalType,
    },
    {
      id: 'daily-expenses-report',
      title: 'Ежедневные расходы',
      description: 'Все расходы за день: покупки, бензин, расходники и прочее',
      icon: <ShoppingCart className="w-5 h-5 text-[#e65100]" />,
      color: 'bg-orange-50',
      accentColor: 'bg-orange-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Расходы за сегодня',
      statValue: '12 850 ₽',
      modalType: 'daily-expense' as ModalType,
    },
    {
      id: 'daily-earnings-report',
      title: 'Заработок за день',
      description: 'Сколько заработали рабочие за сегодня на основе отчетов сотрудников',
      icon: <Clock className="w-5 h-5 text-[#c62828]" />,
      color: 'bg-red-50',
      accentColor: 'bg-red-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Заработок сегодня',
      statValue: '28 400 ₽',
      modalType: 'daily-earning' as ModalType,
    },
    {
      id: 'funds',
      title: 'Фонды',
      description: 'Управление целевыми фондами: премирование, развитие, резервы',
      icon: <PiggyBank className="w-5 h-5 text-[#0d9488]" />,
      color: 'bg-teal-50',
      accentColor: 'bg-teal-500',
      actionLabel: 'Управление фондами',
      statLabel: 'Общий баланс',
      statValue: `${funds.reduce((sum, f) => sum + f.balance, 0).toLocaleString('ru-RU')} ₽`,
      modalType: null,
    },
  ];

  const handleCardClick = (modalType: ModalType) => {
    if (modalType === 'funds') {
      setEditingFund(null);
      setActiveModal('fund-create');
    } else {
      setActiveModal(modalType);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Финансы</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <FinanceReportCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            accentColor={card.accentColor}
            onAction={() => handleCardClick(card.modalType)}
            actionLabel={card.actionLabel}
            statLabel={card.statLabel}
            statValue={card.statValue}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'reports'
              ? 'border-[#1976d2] text-[#1976d2]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Отчеты
        </button>
        <button
          onClick={() => setActiveTab('funds')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'funds'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Фонды
        </button>
      </div>

      {/* Reports Section */}
      {activeTab === 'reports' && (
        <ReportsList reports={reports} onDelete={handleDeleteReport} />
      )}

      {/* Funds Section */}
      {activeTab === 'funds' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Целевые фонды</h2>
            <button
              onClick={() => {
                setEditingFund(null);
                setActiveModal('fund-create');
              }}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <PiggyBank className="w-4 h-4" />
              Создать фонд
            </button>
          </div>

        {funds.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Фондов пока нет</h3>
            <p className="text-gray-500 mb-6">Создайте первый целевой фонд для управления средствами</p>
            <button
              onClick={() => {
                setEditingFund(null);
                setActiveModal('fund-create');
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Создать фонд
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funds.map((fund) => (
              <FundCard
                key={fund.id}
                fund={fund}
                transactions={fundTransactions}
                onEdit={(f) => {
                  setEditingFund(f);
                  setActiveModal('fund-create');
                }}
                onDelete={handleFundDelete}
                onOperation={(f, type) => {
                  setOperationFund(f);
                  setOperationType(type);
                  setActiveModal('fund-operation');
                }}
              />
            ))}
          </div>
        )}

        {fundTransactions.length > 0 && (
          <FundTransactions transactions={fundTransactions} />
        )}
        </div>
      )}

      <ObjectReportModal
        isOpen={activeModal === 'object'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleObjectReportSubmit}
      />
      <AdvanceReportModal
        isOpen={activeModal === 'advance'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAdvanceReportSubmit}
      />
      <SalaryReportModal
        isOpen={activeModal === 'salary'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSalaryReportSubmit}
      />
      <DailyExpenseReportModal
        isOpen={activeModal === 'daily-expense'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleDailyExpenseSubmit}
      />
      <DailyEarningsReportModal
        isOpen={activeModal === 'daily-earning'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleDailyEarningsSubmit}
        existingReports={employeeWorkReports}
      />

      {/* Fund Modals */}
      <FundCreateModal
        isOpen={activeModal === 'fund-create'}
        onClose={() => {
          setActiveModal(null);
          setEditingFund(null);
        }}
        onSubmit={editingFund ? handleFundEdit : handleFundCreate}
        editingFund={editingFund}
      />
      <FundOperationModal
        isOpen={activeModal === 'fund-operation'}
        onClose={() => {
          setActiveModal(null);
          setOperationFund(null);
        }}
        onSubmit={handleFundOperation}
        fund={operationFund}
        operationType={operationType}
      />
    </div>
  );
}
