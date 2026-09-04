'use client';

import { useRef, useEffect } from 'react';
import { Pencil, Plus, Trash2, Save, X, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import * as XLSX from 'xlsx';

interface WorkRow {
  id?: number;
  work: string;
  quantity: string;
  cost: number;
  category?: string;
}

interface WorkTableProps {
  items: WorkRow[];
  editItems: WorkRow[];
  editIndex: number | null;
  onExportExcel: () => void;
  onOpenTemplate: () => void;
  onAddRow: () => void;
  onEdit: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemoveRow: (index: number) => void;
  onRowChange: (index: number, field: string, value: string | number) => void;
  onDeleteRow?: (index: number) => void;
  isSaving?: boolean;
}

export function WorkTable({
  items, editItems, editIndex,
  onExportExcel, onOpenTemplate, onAddRow, onEdit, onSave, onCancel,
  onRemoveRow, onRowChange, onDeleteRow, isSaving,
}: WorkTableProps) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (editIndex === null) return;
    const refs = inputRefs.current;
    editItems.forEach((item, i) => {
      const key = item.id !== undefined ? `edit-${item.id}` : `edit-new-${i}`;
      const el = refs.get(key);
      if (el && document.activeElement !== el) {
        const val = el.value;
        el.value = '';
        requestAnimationFrame(() => { el.value = val; });
      }
    });
  }, [editItems, editIndex]);

  const parseQuantity = (q: string): number => {
    const match = String(q).match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const calcRowTotal = (item: WorkRow): number => {
    const qty = parseQuantity(item.quantity);
    return Math.round(qty * (item.cost || 0) * 100) / 100;
  };

  const total = editIndex !== null
    ? editItems.reduce((sum, item) => sum + calcRowTotal(item), 0)
    : items.reduce((sum, item) => sum + calcRowTotal(item), 0);

  const registerInput = (key: string, el: HTMLInputElement | null) => {
    if (el) {
      inputRefs.current.set(key, el);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button onClick={onExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
          <FileText className="w-4 h-4 mr-2" /> Экспорт в Excel
        </Button>
        {editIndex === null ? (
          <>
            <Button onClick={onOpenTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Виды работ
            </Button>
            <Button onClick={() => onEdit(0)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Pencil className="w-4 h-4 mr-2" /> Редактировать
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onOpenTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Виды работ
            </Button>
            <Button onClick={onAddRow} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Добавить строку
            </Button>
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
              <X className="w-4 h-4 mr-2" /> Отмена
            </Button>
          </>
        )}
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-12">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Работа</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">Категория</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">Количество</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">Цена за ед. (₽)</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">Итого (₽)</th>
            {editIndex !== null && (
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-28">Действия</th>
            )}
          </tr>
        </thead>
        <tbody>
          {editIndex !== null
            ? editItems.map((item, i) => {
                const key = item.id !== undefined ? `edit-${item.id}` : `edit-new-${i}`;
                return (
                  <tr key={key} className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 ${editIndex === i ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}>
                    <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{i + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        ref={(el) => registerInput(`${key}-work`, el)}
                        value={item.work || ''}
                        onChange={(e) => onRowChange(i, 'work', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        ref={(el) => registerInput(`${key}-category`, el)}
                        value={item.category || ''}
                        onChange={(e) => onRowChange(i, 'category', e.target.value)}
                        placeholder="Категория"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        ref={(el) => registerInput(`${key}-quantity`, el)}
                        value={item.quantity || ''}
                        onChange={(e) => onRowChange(i, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <input
                        ref={(el) => registerInput(`${key}-cost`, el)}
                        type="number"
                        value={item.cost || 0}
                        onChange={(e) => onRowChange(i, 'cost', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#1976d2]">
                      {calcRowTotal(item).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => onRemoveRow(i)} className="text-red-600 hover:text-red-800" title="Удалить строку">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            : items.map((item, i) => {
                const rowKey = item.id != null ? `view-${item.id}` : `view-new-${i}`;
                return (
                  <tr key={rowKey} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
                  <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{i + 1}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{item.work}</td>
                  <td className="py-3 px-4"><span className="text-gray-600 dark:text-slate-300 text-sm">{item.category || '—'}</span></td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-300">{item.quantity}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{item.cost?.toLocaleString('ru-RU') || '0'} ₽/ед.</td>
                  <td className="py-3 px-4 text-right font-bold text-[#1976d2]">{calcRowTotal(item).toLocaleString('ru-RU')} ₽</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => onEdit(i)} className="text-blue-600 hover:text-blue-800" title="Редактировать">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white" colSpan={5}>Итого</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">{total.toLocaleString('ru-RU')} ₽</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
