'use client';

import { useState } from 'react';
import { PiggyBank, TrendingUp, TrendingDown, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Fund {
  id: string;
  name: string;
  type: string;
  balance: number;
  targetAmount: number;
  description: string;
  createdAt: string;
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

interface FundCardProps {
  fund: Fund;
  transactions: FundTransaction[];
  onEdit: (fund: Fund) => void;
  onDelete: (id: string) => void;
  onOperation: (fund: Fund, type: 'income' | 'expense') => void;
}

const typeColors: Record<string, string> = {
  bonus: 'bg-green-100 text-green-800',
  development: 'bg-blue-100 text-blue-800',
  emergency: 'bg-red-100 text-red-800',
  equipment: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200',
};

const typeIcons: Record<string, string> = {
  bonus: '🎯',
  development: '📈',
  emergency: '🚨',
  equipment: '🛠️',
  other: '💰',
};

export function FundCard({ fund, transactions, onEdit, onDelete, onOperation }: FundCardProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  const progress = fund.targetAmount > 0 ? Math.min((fund.balance / fund.targetAmount) * 100, 100) : 0;

  const fundTransactions = transactions
    .filter(t => t.fundId === fund.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = fundTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = fundTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group">
      {/* Header gradient */}
      <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />

      <div className="p-6">
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onOperation(fund, 'income')}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            title="Пополнить фонд"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOperation(fund, 'expense')}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Списать из фонда"
          >
            <TrendingDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(fund)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(fund.id)}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Удалить фонд"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">{typeIcons[fund.type] || '💰'}</span>
          </div>
          <div className="flex-1 pr-16">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">{fund.name}</h3>
            </div>
            {fund.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 dark:text-slate-400">{fund.description}</p>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-5">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 dark:text-slate-400">Текущий баланс</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white">{(fund.balance || 0).toLocaleString('ru-RU')} ₽</p>
        </div>

        {/* Progress */}
        {fund.targetAmount > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-300 dark:text-slate-300">Прогресс накопления</span>
              <span className="font-semibold text-gray-900 dark:text-white dark:text-white">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">
              <span>Цель: {(fund.targetAmount || 0).toLocaleString('ru-RU')} ₽</span>
              <span>Осталось: {Math.max(0, fund.targetAmount - fund.balance).toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-green-600 mb-1 dark:text-green-400">Пополнено</p>
            <p className="text-sm font-bold text-green-700 dark:text-green-300">+{totalIncome.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            <p className="text-xs text-red-600 mb-1 dark:text-red-400">Списано</p>
            <p className="text-sm font-bold text-red-700 dark:text-red-300">-{totalExpense.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-blue-600 mb-1 dark:text-blue-400">Операций</p>
            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{fundTransactions.length}</p>
          </div>
        </div>

        {/* Transactions */}
        {fundTransactions.length > 0 && (
          <div>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors py-2 border-t border-gray-200 dark:border-slate-700 dark:border-slate-700"
            >
              <span>История операций ({fundTransactions.length})</span>
              {showTransactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTransactions && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {fundTransactions.map(transaction => (
                  <div key={transaction.id} className="flex items-start justify-between text-sm py-2 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 last:border-0">
                    <div className="flex-1 pr-2">
                      <p className="text-gray-900 dark:text-white dark:text-white text-xs">{transaction.description || '-'}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-0.5">{new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <span className={`font-semibold whitespace-nowrap ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{(transaction.amount || 0).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
