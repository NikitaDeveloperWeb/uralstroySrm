'use client';

import { PiggyBank } from 'lucide-react';
import { FundCard } from '@/shared/components/finance/FundCard';
import { FundTransactions } from '@/shared/components/finance/FundTransactions';
import { FundCreateModal } from '@/shared/components/finance/FundCreateModal';
import { FundOperationModal } from '@/shared/components/finance/FundOperationModal';

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

interface FundManagementProps {
  funds: Fund[];
  fundTransactions: FundTransaction[];
  onEditFund: (fund: Fund) => void;
  onDeleteFund: (id: string) => void;
  onOperation: (fund: Fund, type: 'income' | 'expense') => void;
  onCreateModal: () => void;
}

export function FundManagement({
  funds,
  fundTransactions,
  onEditFund,
  onDeleteFund,
  onOperation,
  onCreateModal,
}: FundManagementProps) {
  if (funds.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
        <PiggyBank className="w-16 h-16 text-gray-300 dark:text-slate-500 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-white mb-2">Фондов пока нет</h3>
        <p className="text-gray-500 dark:text-slate-400 mb-6 dark:text-slate-400">Создайте первый целевой фонд</p>
        <button
          onClick={onCreateModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Создать фонд
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funds.map((fund) => (
          <FundCard
            key={fund.id}
            fund={fund}
            transactions={fundTransactions}
            onEdit={onEditFund}
            onDelete={onDeleteFund}
            onOperation={onOperation}
          />
        ))}
      </div>

      {fundTransactions.length > 0 && (
        <FundTransactions transactions={fundTransactions} />
      )}
    </>
  );
}
