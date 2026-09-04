'use client';

import { useState, useEffect } from 'react';
import { Plus, X, UserPlus } from 'lucide-react';
import { useEmployeeStore } from '@/shared/stores/employeeStore';

interface Expense {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  purpose: string;
  category: string;
  createdAt: string;
}

interface ExpenseItem {
  date: string;
  amount: string;
  recipient: string;
  purpose: string;
  category: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id' | 'createdAt'> & { supplierId?: number }) => void;
}

export function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  const { employees, fetchEmployees } = useEmployeeStore();
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [equipment, setEquipment] = useState<{ id: number; name: string; type: string }[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [showEquipment, setShowEquipment] = useState(false);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; companyName: string }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  useEffect(() => {
    if (isOpen) fetchEmployees();
  }, [isOpen, fetchEmployees]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/expense-categories')
        .then(res => res.json())
        .then(data => {
          const categories = (data as any).data || data || [];
          setExpenseCategories(categories);
        })
        .catch(err => {
          console.error('Failed to fetch expense categories:', err);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/tech-equipment')
        .then(res => res.json())
        .then(data => {
          console.log('Tech equipment API response:', data);
          const items = (data as any).data || data;
          console.log('Tech equipment items:', items);
          if (Array.isArray(items)) {
            setEquipment(items as { id: number; name: string; type: string }[]);
          }
        })
        .catch(err => {
          console.error('Failed to fetch tech equipment:', err);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/suppliers')
        .then(res => res.json())
        .then(data => {
          const items = (data as any).data || data;
          if (Array.isArray(items)) {
            setSuppliers(items.filter((s: any) => s.status === 'active'));
          }
        })
        .catch(err => {
          console.error('Failed to fetch suppliers:', err);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (category !== 'tech') {
      setSelectedEquipment('');
    } else {
      console.log('Category changed to tech, equipment list:', equipment);
    }
  }, [category, equipment]);

  useEffect(() => {
    if (isOpen) fetchEmployees();
  }, [isOpen, fetchEmployees]);

  const filteredEmployees = employees.filter(e =>
    e.fullName.toLowerCase().includes(recipient.toLowerCase())
  );

  const selectEmployee = (fullName: string) => {
    setRecipient(fullName);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setRecipient('');
      setPurpose('');
      setCategory('');
      setSelectedEquipment('');
      setSelectedSupplier('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !amount || !recipient || !purpose || !category) {
      setError('Заполните все поля');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Сумма должна быть больше 0');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Введите корректную сумму');
      return;
    }

    const finalPurpose = category === 'tech' && selectedEquipment
      ? `${purpose} — ${selectedEquipment}`
      : purpose;

    const supplier = suppliers.find(s => s.companyName === selectedSupplier);

    onSubmit({
      date,
      amount: amountNum,
      recipient,
      purpose: finalPurpose,
      category,
      supplierId: supplier?.id,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 h-full overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-[80vw] mx-4 my-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Добавить расход</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Сумма (₽)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Кому выдано</label>
              <input
                type="text"
                placeholder="Выберите сотрудника или введите ФИО"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
              {showSuggestions && filteredEmployees.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => selectEmployee(emp.fullName)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b last:border-0"
                    >
                      {emp.fullName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">На что выдано</label>
              <input
                type="text"
                placeholder="Описание цели расхода"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              />
            </div>

            {category === 'tech' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Техника и оборудование</label>
                <input
                  type="text"
                  placeholder="Выберите технику"
                  value={selectedEquipment}
                  onChange={(e) => { setSelectedEquipment(e.target.value); setShowEquipment(true); }}
                  onFocus={() => setShowEquipment(true)}
                  onBlur={() => setTimeout(() => setShowEquipment(false), 200)}
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                {showEquipment && equipment.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {equipment.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => { setSelectedEquipment(item.name); setShowEquipment(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50 transition-colors border-b last:border-0"
                      >
                        {item.name}
                        {item.type && <span className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 ml-2">({item.type})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Поставщик (опционально)</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="">Не выбран</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.companyName}>
                    {supplier.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                required
              >
                <option value="">Выберите категорию</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить расход
          </button>
        </div>
      </div>
    </div>
  );
}
