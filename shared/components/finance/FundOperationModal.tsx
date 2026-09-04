'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface Fund {
  id: string;
  name: string;
  balance: number;
}

interface FundOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fundId: number;
    type: 'income' | 'expense';
    amount: number;
    description?: string;
    date: string;
  }) => void;
  fund: Fund | null;
  operationType: 'income' | 'expense';
}

export function FundOperationModal({ isOpen, onClose, onSubmit, fund, operationType }: FundOperationModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen && fund) {
      setFormData({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [fund, isOpen]);

  if (!fund || fund.balance === undefined) return null;

  const isIncome = operationType === 'income';
  const maxAmount = isIncome ? Infinity : fund.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0 || amount > maxAmount) return;

    onSubmit({
      fundId: parseInt(fund.id),
      type: operationType,
      amount,
      description: formData.description,
      date: formData.date,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? `Пополнение: ${fund.name}` : `Списание: ${fund.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Текущий баланс</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(fund.balance || 0).toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className={`text-right ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              <p className="text-sm font-medium">{isIncome ? 'Пополнение' : 'Списание'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {isIncome ? 'Добавление средств' : 'Макс: ' + (fund.balance || 0).toLocaleString('ru-RU') + ' ₽'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Сумма (₽)</label>
          <input
            type="number"
            min="0"
            step="100"
            max={maxAmount}
            value={formData.amount}
            onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            placeholder="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Дата</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Описание</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
            placeholder={` reason ${isIncome ? 'пополнения' : 'списания'} средств...`}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > maxAmount}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              !formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > maxAmount
                ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                : isIncome
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isIncome ? 'Пополнить' : 'Списать'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
