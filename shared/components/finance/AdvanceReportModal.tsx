'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Employee } from '@/shared/types/project';
import { useEmployeeStore } from '@/shared/stores/employeeStore';
import { UserCheck, DollarSign, Loader2 } from 'lucide-react';

interface AdvanceEntry {
  employeeId: number;
  employeeName: string;
  amount: string;
  purpose: string;
}

interface AdvanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (advances: { date: string; entries: AdvanceEntry[] }) => void;
}

export function AdvanceReportModal({ isOpen, onClose, onSubmit }: AdvanceReportModalProps) {
  const { employees, fetchEmployees, loading } = useEmployeeStore();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<AdvanceEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setDate(new Date().toISOString().split('T')[0]);
      setEntries([]);
    }
  }, [isOpen, fetchEmployees]);

  const toggleEmployee = (employee: Employee) => {
    setEntries(prev => {
      const exists = prev.find(e => e.employeeId === employee.id);
      if (exists) return prev.filter(e => e.employeeId !== employee.id);
      return [...prev, {
        employeeId: employee.id,
        employeeName: employee.fullName,
        amount: '',
        purpose: '',
      }];
    });
  };

  const updateAmount = (employeeId: number, amount: string) => {
    setEntries(prev => prev.map(e =>
      e.employeeId === employeeId ? { ...e, amount } : e
    ));
  };

  const updatePurpose = (employeeId: number, purpose: string) => {
    setEntries(prev => prev.map(e =>
      e.employeeId === employeeId ? { ...e, purpose } : e
    ));
  };

  const handleSubmit = async () => {
    const validEntries = entries.filter(e => e.amount && parseFloat(e.amount) > 0);
    if (validEntries.length === 0) return;
    setSaving(true);
    try {
      await onSubmit({ date, entries: validEntries });
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = entries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const selectedCount = entries.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Авансовый отчет" height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 pb-4 border-b">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 dark:border-slate-600 px-3 py-2 text-sm"
          />
        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-slate-500" />
            </div>
          ) : (
            <div className="border rounded-lg">
              {employees.map((employee) => {
                const isSelected = entries.some(e => e.employeeId === employee.id);
                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => toggleEmployee(employee)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors ${
                      isSelected ? 'bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <UserCheck className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{employee.fullName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected entries form */}
        {entries.length > 0 && (
          <div className="flex-shrink-0 space-y-3 mt-4 border-t pt-4 max-h-60 overflow-y-auto">
            {entries.map((entry) => (
              <div key={entry.employeeId} className="bg-white dark:bg-slate-800 rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">{entry.employeeName}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type="number"
                      placeholder="Сумма"
                      value={entry.amount}
                      onChange={(e) => updateAmount(entry.employeeId, e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-sm border rounded"
                      min="0"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Цель"
                    value={entry.purpose}
                    onChange={(e) => updatePurpose(entry.employeeId, e.target.value)}
                    className="px-2 py-1.5 text-sm border rounded"
                  />
                </div>
              </div>
            ))}

            <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm font-medium">Итого: {selectedCount} чел.</span>
              <span className="text-lg font-bold">{totalAmount.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || entries.length === 0}
            className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
