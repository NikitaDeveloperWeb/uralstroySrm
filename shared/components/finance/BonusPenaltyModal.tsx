'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useAlert } from '@/shared/hooks/useAlert';
import { Modal } from '@/shared/components/ui/Modal';
import { Employee } from '@/shared/types/project';
import { useEmployeeStore } from '@/shared/stores/employeeStore';
import { UserCheck, DollarSign, Loader2, History, UserPlus, ChevronDown, Trash2 } from 'lucide-react';

interface Item {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  date: string;
  reason: string;
  createdAt: string;
}

interface BonusPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  entityName: string; // 'премия' | 'штраф'
  icon: ReactNode;
  apiEndpoint: string; // '/api/bonuses' | '/api/penalties'
  colors: {
    bg: string; // 'bg-green-50' | 'bg-red-50'
    border: string; // 'border-green-200' | 'border-red-200'
    text: string; // 'text-green-900' | 'text-red-900'
    iconColor: string; // 'text-green-600' | 'text-red-600'
    button: string; // 'bg-green-600' | 'bg-red-600'
    buttonHover: string; // 'hover:bg-green-700' | 'hover:bg-red-700'
    monthBg: string; // 'bg-green-50' | 'bg-red-50'
    monthBorder: string; // 'border-green-200' | 'border-red-200'
    monthText: string; // 'text-green-800' | 'text-red-800'
    monthTotal: string; // 'text-green-700' | 'text-red-700'
    monthIcon: string; // 'text-green-600' | 'text-red-600'
    amountPrefix: string; // '+' | '-'
    emptyIcon: ReactNode;
    emptyTitle: string;
    emptySubtitle: string;
    infoText: string;
    infoBg: string;
    infoTextColor: string;
    placeholder: string;
  };
  onCreated?: () => void;
}

export function BonusPenaltyModal({
  isOpen,
  onClose,
  title,
  entityName,
  icon,
  apiEndpoint,
  colors,
  onCreated,
}: BonusPenaltyModalProps) {
  const { alert, confirm } = useAlert();
  const { employees, fetchEmployees, loading } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedEmployee(null);
      setAmount('');
      setReason('');
      setActiveTab('add');
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      const list = data.success ? (data.data || []) : (Array.isArray(data) ? data : []);
      const mapped: Item[] = list.map((item: any) => ({
        id: item.id,
        employeeId: item.employeeId,
        employeeName: item.employee?.fullName || 'Удалён',
        amount: item.amount,
        date: item.date,
        reason: item.reason,
        createdAt: item.createdAt,
      }));
      setItems(mapped);
    } catch (error) {
      console.error(`Error loading ${entityName}s:`, error);
      setItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleMonth = (monthName: string) => {
    setCollapsedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthName)) {
        next.delete(monthName);
      } else {
        next.add(monthName);
      }
      return next;
    });
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm(`Удалить эту ${entityName}?`))) return;
    try {
      const res = await fetch(`${apiEndpoint}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      await loadHistory();
    } catch (error: unknown) {
      alert((error as Error).message || 'Ошибка при удалении');
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !amount || !reason) return;
    
    setSaving(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          amount: parseFloat(amount),
          date,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      await loadHistory();
      onClose();
      onCreated?.();
    } catch (error: unknown) {
      alert((error as Error).message || `Ошибка при создании ${entityName}`);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'add' as const, label: 'Добавить', icon: UserPlus },
    { id: 'history' as const, label: 'История', icon: History },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} height="h-[90vh]">
      <div className="space-y-4 h-full flex flex-col">
        {/* Tabs */}
        <div className="flex-shrink-0">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add tab */}
        {activeTab === 'add' && (
          <>
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
                    const isSelected = selectedEmployee?.id === employee.id;
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => setSelectedEmployee(employee)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors ${
                          isSelected ? colors.bg : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? `bg-[color:var(--color)] border-[color:var(--color)]` : 'border-gray-300 dark:border-slate-600'
                          }`} style={{
                            backgroundColor: isSelected ? (colors.button.includes('green') ? '#16a34a' : '#dc2626') : undefined,
                            borderColor: isSelected ? (colors.button.includes('green') ? '#16a34a' : '#dc2626') : undefined,
                          }}>
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

            {/* Selected employee form */}
            {selectedEmployee && (
              <div className="flex-shrink-0 space-y-3 mt-4 border-t pt-4">
                <div className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <p className={`text-sm font-medium ${colors.text}`}>{selectedEmployee.fullName}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                      <input
                        type="number"
                        placeholder={colors.placeholder}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-sm border rounded"
                        min="0"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={`Причина ${entityName}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border rounded"
                    />
                  </div>
                </div>

                <div className={`${colors.infoBg} rounded-lg p-3`}>
                  <p className={`text-xs ${colors.infoTextColor}`}>{colors.infoText}</p>
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
                disabled={saving || !selectedEmployee || !amount || !reason}
                className={`px-6 py-2 rounded-lg ${colors.button} ${colors.buttonHover} text-white text-sm font-medium hover:opacity-90 disabled:opacity-50`}
              >
                {saving ? 'Сохранение...' : `Сохранить ${entityName}`}
              </button>
            </div>
          </>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 dark:text-slate-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-slate-700 rounded-lg">
                {colors.emptyIcon}
                <p className="text-gray-500 dark:text-slate-400 font-medium">{colors.emptyTitle}</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{colors.emptySubtitle}</p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {(() => {
                  const monthsMap = new Map<string, Item[]>();
                  items.forEach(item => {
                    const d = new Date(item.date);
                    const monthKey = d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
                    if (!monthsMap.has(monthKey)) monthsMap.set(monthKey, []);
                    monthsMap.get(monthKey)!.push(item);
                  });

                  return Array.from(monthsMap.entries()).map(([monthName, itemsList]) => {
                    const monthTotal = itemsList.reduce((sum, i) => sum + i.amount, 0);
                    return (
                      <div key={monthName}>
                        <div
                          className={`${colors.monthBg} border ${colors.monthBorder} rounded-lg px-4 py-2 mb-3 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity`}
                          onClick={() => toggleMonth(monthName)}
                        >
                          <p className={`text-sm font-bold ${colors.monthText} capitalize`}>{monthName}</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold ${colors.monthTotal}`}>{colors.amountPrefix}{monthTotal.toLocaleString('ru-RU')} ₽</p>
                            <ChevronDown className={`w-4 h-4 ${colors.monthIcon} transition-transform ${collapsedMonths.has(monthName) ? '-rotate-90' : ''}`} />
                          </div>
                        </div>
                        {!collapsedMonths.has(monthName) && (
                          <div className="space-y-2">
                            {itemsList.map((item) => (
                              <div key={item.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.employeeName}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{item.reason}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDelete(item.id)}
                                      className="text-gray-400 dark:text-slate-500 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    <p className={`text-base font-bold ${colors.monthTotal}`}>{colors.amountPrefix}{item.amount.toLocaleString('ru-RU')} ₽</p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                  {new Date(item.date).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
