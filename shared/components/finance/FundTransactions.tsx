'use client';

import { FileText } from 'lucide-react';

interface FundTransaction {
  id: string;
  fundName: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface FundTransactionsProps {
  transactions: FundTransaction[];
}

export function FundTransactions({ transactions }: FundTransactionsProps) {
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">История операций</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Операций по фондам пока нет</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">История операций</h2>
      </div>

      <div className="space-y-3">
        {sortedTransactions.map(transaction => (
          <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type === 'income' ? 'Пополнение' : 'Списание'}
                </span>
                <span className="text-sm font-medium text-gray-900">{transaction.fundName}</span>
              </div>
              <p className="text-sm text-gray-600">{transaction.description || 'Без описания'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(transaction.date).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <span className={`text-lg font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
