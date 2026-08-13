'use client';

import { Pencil, Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface TableRow {
  id?: number;
  name?: string;
  quantity: string;
  cost: number;
  category?: string | null;
}

interface EditableTableProps<T extends TableRow> {
  items: T[];
  editItems: T[];
  editIndex: number | null;
  title: string;
  itemName: string;
  onPrint: () => void;
  onOpenTemplate: () => void;
  onAddRow: () => void;
  onEdit: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemoveRow: (index: number) => void;
  onRowChange: (index: number, field: keyof T, value: string | number) => void;
  isSaving?: boolean;
}

export function EditableTable<T extends TableRow>({
  items, editItems, editIndex, title, itemName,
  onPrint, onOpenTemplate, onAddRow, onEdit, onSave, onCancel,
  onRemoveRow, onRowChange, isSaving,
}: EditableTableProps<T>) {
  const total = editItems.reduce((s, i) => s + (i.cost || 0), 0);

  const renderRow = (item: T, i: number) => (
    <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 ${editIndex !== null && i === editIndex ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}>
      <td className="py-3 px-4 text-gray-400 text-sm">{i + 1}</td>
      {editIndex !== null ? (
        <>
          <td className="py-3 px-4">
            <input
              value={editItems[i]?.[itemName as keyof T] as string || ''}
              onChange={(e) => onRowChange(i, itemName as keyof T, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </td>
          <td className="py-3 px-4">
            <input
              value={item.category || ''}
              onChange={(e) => onRowChange(i, 'category', e.target.value)}
              placeholder="Категория"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </td>
          <td className="py-3 px-4">
            <input
              value={editItems[i]?.quantity || ''}
              onChange={(e) => onRowChange(i, 'quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </td>
          <td className="py-3 px-4 text-right">
            <input
              type="number"
              value={editItems[i]?.cost || 0}
              onChange={(e) => onRowChange(i, 'cost', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </td>
          <td className="py-3 px-4 text-center">
            <button onClick={() => onRemoveRow(i)} className="text-red-600 hover:text-red-800" title="Удалить строку"><Trash2 className="w-4 h-4" /></button>
          </td>
        </>
      ) : (
        <>
          <td className="py-3 px-4 text-gray-900">{item[itemName as keyof T] as string}</td>
          <td className="py-3 px-4">
            <span className="text-gray-600 text-sm">{item.category || '—'}</span>
          </td>
          <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
          <td className="py-3 px-4 text-right font-medium text-gray-900">{item.cost?.toLocaleString('ru-RU') || '0'}</td>
          <td className="py-3 px-4 text-center">
            <button onClick={() => onEdit(i)} className="text-blue-600 hover:text-blue-800" title="Редактировать"><Pencil className="w-4 h-4" /></button>
          </td>
        </>
      )}
    </tr>
  );

  return (
    <div>
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button onClick={onPrint} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">🖨 Печать</Button>
        {editIndex === null ? (
          <>
            <Button onClick={onOpenTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">📑 Шаблоны</Button>
            <Button onClick={() => { onEdit(0); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Pencil className="w-4 h-4 mr-2" /> Редактировать
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onAddRow} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Добавить строку
            </Button>
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <X className="w-4 h-4 mr-2" /> Отмена
            </Button>
          </>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{title}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-32">Категория</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-32">Количество</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-36">Стоимость (₽)</th>
            {editIndex !== null && (
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-28">Действия</th>
            )}
          </tr>
        </thead>
        <tbody>
          {editIndex !== null ? editItems.map(renderRow) : items.map(renderRow)}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="py-3 px-4 font-bold text-gray-900" colSpan={4}>Итого</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">{total.toLocaleString('ru-RU')} ₽</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
