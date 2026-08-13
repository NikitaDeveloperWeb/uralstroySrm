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
  other: 'bg-gray-100 text-gray-800',
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

  const recentTransactions = transactions
    .filter(t => t.fundId === fund.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onOperation(fund, 'income')}
          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
          title="Пополнить фонд"
        >
          <TrendingUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onOperation(fund, 'expense')}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          title="Списать из фонда"
        >
          <TrendingDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(fund)}
          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
          title="Редактировать"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(fund.id)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Удалить фонд"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{typeIcons[fund.type] || '💰'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{fund.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[fund.type] || typeColors.other}`}>
              {fund.type}
            </span>
          </div>
          <p className="text-sm text-gray-500">{fund.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Баланс</p>
            <p className="text-2xl font-bold text-gray-900">{fund.balance.toLocaleString('ru-RU')} ₽</p>
          </div>
          {fund.targetAmount > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Цель</p>
              <p className="text-sm font-semibold text-gray-700">{fund.targetAmount.toLocaleString('ru-RU')} ₽</p>
            </div>
          )}
        </div>

        {fund.targetAmount > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Прогресс</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {recentTransactions.length > 0 && (
        <div>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full"
          >
            <span>Последние операции ({recentTransactions.length})</span>
            {showTransactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTransactions && (
            <div className="mt-3 space-y-2">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900">{transaction.description || '-'}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
