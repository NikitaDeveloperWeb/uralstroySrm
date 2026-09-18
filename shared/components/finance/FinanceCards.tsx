'use client';

import { Plus, ShoppingCart, Wallet, Users, Clock, PiggyBank, AlertTriangle, Star, ArrowUpCircle, BarChart3, FileText, HandCoins } from 'lucide-react';
import { FinanceReportCard } from '@/shared/components/finance/FinanceReportCard';

interface FinanceCardsProps {
  todayExpenses: number;
  totalBalance: number;
  todayIncome: number;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onViewExpenseReport: () => void;
  onViewAdvance: () => void;
  onViewSalary: () => void;
  onViewEarnings: () => void;
  onViewPenalty: () => void;
  onViewBonus: () => void;
  onViewSummary: () => void;
  onViewEOT: () => void;
  onViewEmployeeAdvance: () => void;
  onGenerateSalary?: () => void;
  onManageFunds: () => void;
}

export function FinanceCards({
  todayExpenses,
  totalBalance,
  todayIncome,
  onAddExpense,
  onAddIncome,
  onViewExpenseReport,
  onViewAdvance,
  onViewSalary,
  onViewEarnings,
  onViewPenalty,
  onViewBonus,
  onViewSummary,
  onViewEOT,
  onViewEmployeeAdvance,
  onGenerateSalary,
  onManageFunds,
}: FinanceCardsProps) {
  const cards = [
    {
      id: 'expenses',
      title: 'Расходы',
      description: 'Все расходы: покупки, бензин, расходники',
      icon: <ShoppingCart className="w-5 h-5 text-[#e65100]" />,
      color: 'bg-orange-50',
      accentColor: 'bg-orange-500',
      actionLabel: 'Открыть',
      statLabel: 'Расходы за сегодня',
      statValue: `${todayExpenses.toLocaleString('ru-RU')} ₽`,
      onClick: onViewExpenseReport,
    },
    {
      id: 'advance',
      title: 'Авансовые отчеты',
      description: 'Выдача авансов сотрудникам с выбором списка',
      icon: <Wallet className="w-5 h-5 text-[#2e7d32]" />,
      color: 'bg-green-50',
      accentColor: 'bg-green-500',
      actionLabel: 'Создать отчет',
      statLabel: 'Выдано авансов',
      statValue: '—',
      onClick: onViewAdvance,
    },
    {
      id: 'salary',
      title: 'Зарплатные отчеты',
      description: 'Автоматический расчет по сменам и авансам',
      icon: <Users className="w-5 h-5 text-[#7b1fa2]" />,
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500',
      actionLabel: 'Открыть',
      statLabel: 'Отчетов',
      statValue: '—',
      onClick: onViewSalary,
    },
    {
      id: 'penalty',
      title: 'Штрафы',
      description: 'Выдача штрафов сотрудникам',
      icon: <AlertTriangle className="w-5 h-5 text-[#dc2626]" />,
      color: 'bg-red-50',
      accentColor: 'bg-red-500',
      actionLabel: 'Добавить штраф',
      statLabel: 'Штрафов',
      statValue: '—',
      onClick: onViewPenalty,
    },
    {
      id: 'bonus',
      title: 'Премии',
      description: 'Выдача премий сотрудникам за заслуги',
      icon: <Star className="w-5 h-5 text-[#16a34a]" />,
      color: 'bg-green-50',
      accentColor: 'bg-green-500',
      actionLabel: 'Добавить премию',
      statLabel: 'Премий',
      statValue: '—',
      onClick: onViewBonus,
    },
    {
      id: 'earnings',
      title: 'Приход',
      description: 'Платежи клиентов по проектам за день, неделю, месяц, год',
      icon: <ArrowUpCircle className="w-5 h-5 text-[#0d9488]" />,
      color: 'bg-teal-50',
      accentColor: 'bg-teal-500',
      actionLabel: 'Открыть',
      statLabel: 'Приход сегодня',
      statValue: `${todayIncome.toLocaleString('ru-RU')} ₽`,
      onClick: onViewEarnings,
    },
    {
      id: 'funds',
      title: 'Фонды',
      description: 'Премирование, развитие, резервы',
      icon: <PiggyBank className="w-5 h-5 text-[#0d9488]" />,
      color: 'bg-teal-50',
      accentColor: 'bg-teal-500',
      actionLabel: 'Управление фондами',
      statLabel: 'Общий баланс',
      statValue: `${totalBalance.toLocaleString('ru-RU')} ₽`,
      onClick: onManageFunds,
    },
    {
      id: 'summary',
      title: 'Общий отчет',
      description: 'Доходы, расходы, прибыль за период с графиком',
      icon: <BarChart3 className="w-5 h-5 text-[#9333ea]" />,
      color: 'bg-purple-50',
      accentColor: 'bg-purple-500',
      actionLabel: 'Открыть',
      statLabel: 'Период',
      statValue: 'Месяц',
      onClick: onViewSummary,
    },
    {
      id: 'eot',
      title: 'ЕОТ',
      description: 'Единый отчет об оплате труда',
      icon: <FileText className="w-5 h-5 text-[#0891b2]" />,
      color: 'bg-cyan-50',
      accentColor: 'bg-cyan-500',
      actionLabel: 'Открыть',
      statLabel: 'Отчетов',
      statValue: '—',
      onClick: onViewEOT,
    },
    {
      id: 'employee-advance',
      title: 'Подотчетные деньги',
      description: 'Выдача подотчетов сотрудникам с историей',
      icon: <HandCoins className="w-5 h-5 text-[#ea580c]" />,
      color: 'bg-orange-50',
      accentColor: 'bg-orange-500',
      actionLabel: 'Открыть',
      statLabel: 'Активных подотчетов',
      statValue: '—',
      onClick: onViewEmployeeAdvance,
    },
  ];

  return (
    <>
      <div className="flex justify-end gap-3">
        <button
          onClick={onAddIncome}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить приход
        </button>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить расход
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.filter(c => c.id !== 'employee-advance').map((card) => (
          <FinanceReportCard
            key={card.id}
            title={card.title}
            description={card.description}
            icon={card.icon}
            color={card.color}
            accentColor={card.accentColor}
            onAction={card.onClick}
            actionLabel={card.actionLabel}
            statLabel={card.statLabel}
            statValue={card.statValue}
          />
        ))}
        {/* Подотчетные - отдельная строка на всю ширину */}
        <div className="col-span-1 md:col-span-2 xl:col-span-3">
          {cards.find(c => c.id === 'employee-advance') && (
            <FinanceReportCard
              key="employee-advance"
              title={cards.find(c => c.id === 'employee-advance')!.title}
              description={cards.find(c => c.id === 'employee-advance')!.description}
              icon={cards.find(c => c.id === 'employee-advance')!.icon}
              color={cards.find(c => c.id === 'employee-advance')!.color}
              accentColor={cards.find(c => c.id === 'employee-advance')!.accentColor}
              onAction={cards.find(c => c.id === 'employee-advance')!.onClick}
              actionLabel={cards.find(c => c.id === 'employee-advance')!.actionLabel}
              statLabel={cards.find(c => c.id === 'employee-advance')!.statLabel}
              statValue={cards.find(c => c.id === 'employee-advance')!.statValue}
            />
          )}
        </div>
      </div>
    </>
  );
}
