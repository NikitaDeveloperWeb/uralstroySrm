'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; date: string; comment: string }) => Promise<void>;
  initialData?: { amount: number; date: string; comment: string } | null;
  isEditing?: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isEditing = false,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setAmount(initialData.amount.toString());
        setDate(initialData.date.split('T')[0]);
        setComment(initialData.comment || '');
      } else {
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setComment('');
      }
      setError(null);
    }
  }, [isOpen, isEditing, initialData]);

  const handleSave = async () => {
    const parsedAmount = parseInt(amount);
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    if (!date) {
      setError('Выберите дату');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        amount: parsedAmount,
        date,
        comment,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Редактировать транзакцию' : 'Новая транзакция'}
      maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Сумма (₽)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите сумму"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Необязательно"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300 text-gray-700">
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={saving}>
            {saving ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Добавить')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
