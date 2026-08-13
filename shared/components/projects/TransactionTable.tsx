'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TransactionModal } from './TransactionModal';
import { ProjectTransaction } from '@/shared/types/project';

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
    if (!confirm('Удалить транзакцию?')) return;
    
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Транзакции</h2>
          <p className="text-sm text-gray-500 mt-1">
            Всего транзакций: {transactions.length}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTransaction(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Добавить транзакцию
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <p className="text-sm text-gray-600 mb-1">Стоимость объекта</p>
          <p className="text-lg font-semibold text-gray-900">
            {projectCost.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Оплачено</p>
          <p className="text-lg font-semibold text-green-600">
            {totalTransactions.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Остаток</p>
          <p className={`text-lg font-semibold ${remaining >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {remaining.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {projectCost > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс оплаты</span>
            <span>{paidPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Дата</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Сумма</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Комментарий</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-24">Действия</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 text-sm">{index + 1}</td>
                  <td className="py-3 px-4 text-gray-900">{formatDate(transaction.date)}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {transaction.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {transaction.comment || '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleEdit(transaction)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(transaction.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={deletingId === transaction.id}>
                        {deletingId === transaction.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Нет транзакций. Нажмите «Добавить транзакцию» для создания первой.
                  </td>
                </tr>
              )}
            </tbody>
            {transactions.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900" colSpan={2}>
                    Итого
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">
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
    </div>
  );
}
