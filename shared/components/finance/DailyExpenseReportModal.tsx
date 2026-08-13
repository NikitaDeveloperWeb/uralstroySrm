import { useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';

interface ExpenseItem {
  category: string;
  amount: string;
  description: string;
}

interface DailyExpenseReport {
  id: string;
  date: string;
  items: ExpenseItem[];
  total: number;
  note: string;
  createdAt: string;
}

interface DailyExpenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<DailyExpenseReport, 'id' | 'total' | 'createdAt'>) => void;
}

export function DailyExpenseReportModal({ isOpen, onClose, onSubmit }: DailyExpenseReportModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([
    { category: 'fuel', amount: '', description: '' },
  ]);

  const categories = [
    { value: 'fuel', label: 'Бензин/ГСМ' },
    { value: 'materials', label: 'Материалы' },
    { value: 'tools', label: 'Инструменты' },
    { value: 'food', label: 'Продукты' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'other', label: 'Прочее' },
  ];

  const addItem = () => {
    setItems([...items, { category: 'other', amount: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.every((i) => !i.amount)) return;
    onSubmit({
      date,
      items: items.filter((i) => i.amount),
      note,
    });
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setItems([{ category: 'fuel', amount: '', description: '' }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ежедневные расходы" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Позиции расходов</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <select
                  value={item.category}
                  onChange={(e) => updateItem(index, 'category', e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 min-w-[140px]"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Сумма"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="text"
                  placeholder="Описание"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="flex-[2] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Добавить позицию
          </button>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-orange-800">Итого:</span>
          <span className="text-xl font-bold text-orange-900">{total.toLocaleString('ru-RU')} ₽</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Примечание</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            rows={2}
            placeholder="Дополнительные комментарии..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700"
          >
            Сохранить отчет
          </button>
        </div>
      </form>
    </Modal>
  );
}
