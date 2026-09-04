'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Save, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface OverheadItem {
  id?: number;
  name: string;
  cost: number;
  category?: string | null;
}

interface TemplateItem {
  id: number;
  name: string;
  cost: number;
  category?: string | null;
}

interface Props {
  overheads: OverheadItem[];
  overheadTemplates: TemplateItem[];
  onOpenTemplates: () => void;
  onSave: (overheads: OverheadItem[]) => Promise<void>;
  isSaving: boolean;
}

export function ProjectOverheads({
  overheads,
  overheadTemplates,
  onOpenTemplates,
  onSave,
  isSaving,
}: Props) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editOverheads, setEditOverheads] = useState<OverheadItem[]>([]);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (editIndex === null) return;
    const refs = inputRefs.current;
    editOverheads.forEach((item, i) => {
      const key = item.id !== undefined ? `edit-${item.id}` : `edit-new-${i}`;
      const el = refs.get(key);
      if (el && document.activeElement !== el) {
        const val = el.value;
        el.value = '';
        requestAnimationFrame(() => { el.value = val; });
      }
    });
  }, [editOverheads, editIndex]);

  const editable = editOverheads.length > 0 ? editOverheads : overheads;
  const total = editable.reduce((sum, h) => sum + (h.cost || 0), 0);

  const registerInput = useCallback((key: string, el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(key, el);
  }, []);

  const handleEdit = useCallback((index: number) => {
    setEditIndex(index);
    setEditOverheads(editable.map((h) => ({ ...h })));
  }, [editable]);

  const handleSave = useCallback(async () => {
    await onSave(editOverheads);
    setEditIndex(null);
    setEditOverheads([]);
  }, [editOverheads, onSave]);

  const handleCancel = useCallback(() => {
    setEditIndex(null);
    setEditOverheads([]);
  }, []);

  const addRow = useCallback(() => {
    setEditOverheads(prev => [...prev, { name: '', cost: 0, category: null }]);
    setEditIndex(editOverheads.length);
  }, [editOverheads.length]);

  const removeRow = useCallback((index: number) => {
    setEditOverheads(prev => prev.filter((_, i) => i !== index));
  }, []);

  const onRowChange = useCallback((index: number, field: keyof OverheadItem, value: string | number | null) => {
    setEditOverheads(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }, []);

  return (
    <div className="mb-4">
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button onClick={() => window.print()} variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">🖨 Печать</Button>
        {editIndex === null ? (
          <>
            <Button onClick={onOpenTemplates} className="bg-purple-600 hover:bg-purple-700 text-white">📑 Шаблоны</Button>
            {overheads.length > 0 && (
              <Button onClick={() => handleEdit(0)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Pencil className="w-4 h-4 mr-2" /> Редактировать
              </Button>
            )}
          </>
        ) : (
          <>
            <Button onClick={addRow} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Добавить строку
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />{isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button onClick={handleCancel} variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
              <X className="w-4 h-4 mr-2" /> Отмена
            </Button>
          </>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-12">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">Расход</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">Категория</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">Стоимость (₽)</th>
            {editIndex !== null && (
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-28">Действия</th>
            )}
          </tr>
        </thead>
        <tbody>
          {editable.map((h, i) => {
            const item = editOverheads[i] || h;
            const key = item.id !== undefined ? `edit-${item.id}` : `edit-new-${i}`;
            return (
              <tr key={key} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
                <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{i + 1}</td>
                {editIndex !== null ? (
                  <>
                    <td className="py-3 px-4">
                      <input ref={(el) => registerInput(`${key}-name`, el)} value={item.name || ''} onChange={(e) => onRowChange(i, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="py-3 px-4">
                      <input ref={(el) => registerInput(`${key}-category`, el)} value={item.category || ''} onChange={(e) => onRowChange(i, 'category', e.target.value || null)} placeholder="Категория" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <input ref={(el) => registerInput(`${key}-cost`, el)} type="number" value={item.cost || 0} onChange={(e) => onRowChange(i, 'cost', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => removeRow(i)} className="text-red-600 hover:text-red-800" title="Удалить строку"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{h.name}</td>
                    <td className="py-3 px-4"><span className="text-gray-600 dark:text-slate-300 text-sm">{h.category || '—'}</span></td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{h.cost?.toLocaleString('ru-RU') || '0'}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleEdit(i)} className="text-blue-600 hover:text-blue-800" title="Редактировать"><Pencil className="w-4 h-4" /></button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white" colSpan={3}>Итого</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">{total.toLocaleString('ru-RU')} ₽</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
