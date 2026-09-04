'use client';

import { Plus, ShoppingCart, Wallet, Users, Clock, PiggyBank, FileText, AlertTriangle, Star, ArrowUpCircle, BarChart3 } from 'lucide-react';
import { FinanceReportCard } from '@/shared/components/finance/FinanceReportCard';

interface FinanceCardsProps {
  todayExpenses: number;
  totalBalance: number;
  todayIncome: number;
  eotCount: number;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onViewExpenseReport: () => void;
  onViewAdvance: () => void;
  onViewSalary: () => void;
  onViewEarnings: () => void;
  onViewEOT: () => void;
  onViewPenalty: () => void;
  onViewBonus: () => void;
  onViewSummary: () => void;
  onGenerateSalary?: () => void;
  onManageFunds: () => void;
}

export function FinanceCards({
  todayExpenses,
  totalBalance,
  todayIncome,
  eotCount,
  onAddExpense,
  onAddIncome,
  onViewExpenseReport,
  onViewAdvance,
  onViewSalary,
  onViewEarnings,
  onViewEOT,
  onViewPenalty,
  onViewBonus,
  onViewSummary,
  onGenerateSalary,
  onManageFunds,
}: FinanceCardsProps) {
  const cards = [
    {
      id: 'eot',
      title: 'ЕОТ (Отчет об оплате труда)',
      description: 'Расчет зарплаты за день: сменные и сдельные сотрудники',
      icon: <FileText className="w-5 h-5 text-[#1976d2]" />,
      color: 'bg-blue-50',
      accentColor: 'bg-blue-500',
      actionLabel: 'Просмотреть',
      statLabel: 'Отчетов',
      statValue: `${eotCount} шт`,
      onClick: onViewEOT,
    },
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
        {cards.map((card) => (
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
      </div>
    </>
  );
}
