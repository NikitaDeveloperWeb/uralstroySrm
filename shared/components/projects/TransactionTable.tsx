'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TransactionModal } from './TransactionModal';
import { ProjectTransaction } from '@/shared/types/project';
import { useAlert } from '@/shared/hooks/useAlert';

interface TransactionTableProps {
  transactions: ProjectTransaction[];
  projectCost: number;
  loading: boolean;
  error: string | null;
  onCreate: (data: { amount: number; date: string; comment: string }) => Promise<void>;
  onUpdate: (id: number, data: { amount: number; date: string; comment: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TransactionTable({
  transactions,
  projectCost,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: TransactionTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ProjectTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalTransactions = transactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = projectCost - totalTransactions;
  const paidPercentage = projectCost > 0 ? Math.min(100, Math.round((totalTransactions / projectCost) * 100)) : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

  const handleEdit = (transaction: ProjectTransaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const { confirm } = useAlert();
    if (!(await confirm('Удалить транзакцию?'))) return;
    
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (data: { amount: number; date: string; comment: string }) => {
    if (editingTransaction) {
      await onUpdate(editingTransaction.id, data);
    } else {
      await onCreate(data);
    }
    setEditingTransaction(null);
    setShowModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Финансовые транзакции</h2>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Платежи и переводы</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-white dark:bg-slate-800/50 transition-colors"
              title={isCollapsed ? 'Показать' : 'Скрыть'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              )}
            </button>
            <Button
              onClick={() => {
                setEditingTransaction(null);
                setShowModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wide mb-1">Стоимость объекта</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{projectCost.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-green-200 dark:border-green-700 shadow-sm">
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">Оплачено</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{totalTransactions.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className={`bg-white dark:bg-slate-800 rounded-lg p-4 border shadow-sm ${remaining >= 0 ? 'border-blue-200 dark:border-blue-700' : 'border-red-200 dark:border-red-700'}`}>
              <p className="text-xs font-medium text-gray-600 dark:text-slate-300 uppercase tracking-wide mb-1">Остаток</p>
              <p className={`text-xl font-bold ${remaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {remaining.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {!isCollapsed && projectCost > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300 mb-2">
              <span className="font-medium">Прогресс оплаты</span>
              <span className="font-bold text-emerald-600">{paidPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          {/* Error */}
          {error && (
            <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-slate-500" />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider w-12">#</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Дата</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Сумма</th>
                    <th className="text-left py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Комментарий</th>
                    <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider w-24">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-colors">
                      <td className="py-4 px-6 text-gray-400 dark:text-slate-500 text-sm font-mono">{index + 1}</td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{formatDate(transaction.date)}</td>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-slate-300 text-sm max-w-xs truncate">
                        {transaction.comment || '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Редактировать"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            disabled={deletingId === transaction.id}
                            title="Удалить"
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl">📝</span>
                          <p className="text-gray-500 dark:text-slate-400 font-medium">Нет транзакций</p>
                          <p className="text-sm text-gray-400 dark:text-slate-500">
                            Нажмите «Добавить» для создания первой транзакции
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                {transactions.length > 0 && (
                  <tfoot>
                    <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-t-2 border-emerald-200 dark:border-emerald-700">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white" colSpan={2}>
                        Итого
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                        {totalTransactions.toLocaleString('ru-RU')} ₽
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}

          {/* Modal */}
          <TransactionModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingTransaction(null);
            }}
            onSave={handleSave}
            initialData={editingTransaction ? {
              amount: editingTransaction.amount,
              date: editingTransaction.date,
              comment: editingTransaction.comment || '',
            } : null}
            isEditing={!!editingTransaction}
          />
        </>
      )}
    </div>
  );
}
