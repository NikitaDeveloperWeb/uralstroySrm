'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/button';

interface Advance {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  date: string;
  purpose: string | null;
  status: string;
}

interface Employee {
  id: number;
  fullName: string;
}

export function EmployeeAdvanceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAdvances();
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employee-advances');
      const data = await res.json();
      if (data.success) {
        setAdvances(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch advances:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleAddAdvance = async () => {
    if (!selectedEmployee || !amount) {
      alert('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/employee-advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: Number(selectedEmployee),
          employeeName: employees.find(e => e.id === Number(selectedEmployee))?.fullName || '',
          amount: Number(amount),
          date,
          purpose: purpose || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при добавлении');
        return;
      }

      setShowForm(false);
      setSelectedEmployee('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPurpose('');
      await fetchAdvances();
    } catch (err) {
      console.error('Failed to add advance:', err);
      alert('Ошибка при добавлении подотчета');
    } finally {
      setSaving(false);
    }
  };

  const handleSettleAdvance = async (id: number) => {
    if (!confirm('Отметить подотчет как погашенный?')) return;

    try {
      const res = await fetch(`/api/employee-advances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'settled' }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при обновлении');
        return;
      }

      await fetchAdvances();
    } catch (err) {
      console.error('Failed to settle advance:', err);
      alert('Ошибка при обновлении подотчета');
    }
  };

  const handleDeleteAdvance = async (id: number) => {
    if (!confirm('Удалить эту запись?')) return;

    try {
      const res = await fetch(`/api/employee-advances/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Ошибка при удалении');
        return;
      }

      await fetchAdvances();
    } catch (err) {
      console.error('Failed to delete advance:', err);
      alert('Ошибка при удалении');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const totalActive = advances
    .filter(a => a.status === 'active')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Подотчетные деньги"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Активных подотчетов</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {advances.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Общая сумма выдано</p>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatCurrency(totalActive)} ₽
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Погашено</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {advances.filter(a => a.status === 'settled').length}
            </p>
          </div>
        </div>

        {/* Кнопка добавления */}
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Выдать подотчет
        </Button>

        {/* Форма добавления */}
        {showForm && (
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Новый подотчет</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Сотрудник *
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Выберите сотрудника</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Сумма (₽) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Дата
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Назначение
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Необязательно"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddAdvance}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Сохранение...' : 'Выдать'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Список подотчетов */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {advances.map(advance => (
              <div
                key={advance.id}
                className={`p-4 rounded-lg border ${
                  advance.status === 'active'
                    ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                    : 'bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {advance.employeeName}
                      </span>
                      {advance.status === 'active' ? (
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                          Активен
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          Погашен
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatDate(advance.date)}
                      {advance.purpose && ` — ${advance.purpose}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(advance.amount)} ₽
                    </span>
                    {advance.status === 'active' ? (
                      <button
                        onClick={() => handleSettleAdvance(advance.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors p-1"
                        title="Отметить как погашенный"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleDeleteAdvance(advance.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {advances.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-slate-400">
                Подотчетов пока нет
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
