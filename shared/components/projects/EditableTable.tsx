'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Pencil, Plus, Trash2, Save, X, CheckCircle, Clock, Search, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';

interface TableRow {
  id?: number;
  name?: string;
  quantity: string;
  cost: number;
  category?: string | null;
}

interface Material {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price?: number;
  cost?: number;
  status: 'in-stock' | 'ordered';
}

interface EditableTableProps<T extends TableRow> {
  items: T[];
  editItems: T[];
  editIndex: number | null;
  title: string;
  itemName: string;
  onExportExcel: () => void;
  onOpenTemplate?: () => void;
  onAddRow: () => void;
  onEdit: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemoveRow: (index: number) => void;
  onRowChange: (index: number, field: keyof T, value: string | number) => void;
  onDeleteRow?: (index: number) => void;
  isSaving?: boolean;
  materials?: Material[];
  onApplyMaterial?: (material: Material) => void;
  useWarehousePicker?: boolean;
}

export function EditableTable<T extends TableRow>({
  items, editItems, editIndex, title, itemName,
  onExportExcel, onOpenTemplate, onAddRow, onEdit, onSave, onCancel,
  onRemoveRow, onRowChange, onDeleteRow, isSaving, materials, onApplyMaterial, useWarehousePicker = false,
}: EditableTableProps<T>) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const parseQuantity = (q: string): number => {
    const match = String(q).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      [title],
      ['#', 'Наименование', 'Категория', 'Количество', 'Цена за ед.', 'Сумма'],
    ];
    let total = 0;
    editItems.forEach((item, i) => {
      const qty = parseQuantity(item.quantity);
      const price = item.cost || 0;
      const amount = Math.round(qty * price * 100) / 100;
      total += amount;
      rows.push([String(i + 1), item[itemName as keyof T] as string, item.category || '—', item.quantity, String(price), String(amount)]);
    });
    rows.push(['', 'Итого', '', '', '', String(total)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const borderStyle = { style: 'thin', color: { rgb: '000000' } };
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        if (!ws[addr].s) ws[addr].s = {};
        ws[addr].s.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
        if (R === 1) ws[addr].s.font = { bold: true };
        if (R === rows.length - 1) ws[addr].s.font = { bold: true };
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, title.replace(/\s+/g, '_') + '.xlsx');
  };

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



  const rowTotal = useCallback((item: T): number => {
    const qty = parseQuantity(item.quantity);
    return Math.round(qty * (item.cost || 0) * 100) / 100;
  }, [parseQuantity]);

  const total = editItems.reduce((s, i) => s + rowTotal(i), 0);

  const registerInput = useCallback((key: string, el: HTMLInputElement | null) => {
    if (el) inputRefs.current.set(key, el);
  }, []);

  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [materialTab, setMaterialTab] = useState<'in-stock' | 'ordered'>('in-stock');
  const [materialSearch, setMaterialSearch] = useState('');

  const filteredMaterials = (materials || [])
    .filter(m => m.status === materialTab)
    .filter(m => 
      m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(materialSearch.toLowerCase())
    );

  const inStockCount = (materials || []).filter(m => m.status === 'in-stock').length;
  const orderedCount = (materials || []).filter(m => m.status === 'ordered').length;

  const renderRow = useCallback((item: T, i: number) => {
    if (editIndex !== null) {
      const key = item.id !== undefined ? `edit-${item.id}` : `edit-new-${i}`;
      return (
        <tr key={key} className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 ${editIndex === i ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}>
          <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{i + 1}</td>
          <td className="py-3 px-4">
            <input ref={(el) => registerInput(`${key}-${itemName}`, el)} value={item[itemName as keyof T] as string || ''} onChange={(e) => onRowChange(i, itemName as keyof T, e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </td>
          <td className="py-3 px-4">
            <input ref={(el) => registerInput(`${key}-category`, el)} value={item.category || ''} onChange={(e) => onRowChange(i, 'category', e.target.value)} placeholder="Категория" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </td>
          <td className="py-3 px-4">
            <input ref={(el) => registerInput(`${key}-quantity`, el)} value={item.quantity || ''} onChange={(e) => onRowChange(i, 'quantity', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center" />
          </td>
          <td className="py-3 px-4 text-right">
            <input ref={(el) => registerInput(`${key}-cost`, el)} type="number" value={item.cost || 0} onChange={(e) => onRowChange(i, 'cost', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" />
          </td>
          <td className="py-3 px-4 text-right font-bold text-[#1976d2]">{rowTotal(editItems[i]!).toLocaleString('ru-RU')} ₽</td>
          <td className="py-3 px-4 text-center">
            <button onClick={() => onRemoveRow(i)} className="text-red-600 hover:text-red-800" title="Удалить строку"><Trash2 className="w-4 h-4" /></button>
          </td>
        </tr>
      );
    }
    return (
      <tr key={i} className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
        <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{i + 1}</td>
        <td className="py-3 px-4 text-gray-900 dark:text-white">{item[itemName as keyof T] as string}</td>
        <td className="py-3 px-4"><span className="text-gray-600 dark:text-slate-300 text-sm">{item.category || '—'}</span></td>
        <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-300">{item.quantity}</td>
        <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{item.cost?.toLocaleString('ru-RU') || '0'} ₽/ед.</td>
        <td className="py-3 px-4 text-right font-bold text-[#1976d2]">{rowTotal(item).toLocaleString('ru-RU')} ₽</td>
        <td className="py-3 px-4 text-center">
          <button onClick={() => onEdit(i)} className="text-blue-600 hover:text-blue-800" title="Редактировать"><Pencil className="w-4 h-4" /></button>
        </td>
      </tr>
    );
  }, [editIndex, editItems, itemName, onRowChange, onRemoveRow, onEdit, rowTotal, registerInput]);

  return (
    <div>
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-semibold">
          <FileText className="w-4 h-4 mr-2" /> Экспорт в Excel
        </Button>
        {editIndex === null ? (
          <>
            {useWarehousePicker ? (
              <Button onClick={() => setShowMaterialPicker(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Шаблоны
              </Button>
            ) : onOpenTemplate ? (
              <Button onClick={onOpenTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Шаблоны
              </Button>
            ) : null}
            <Button onClick={() => onEdit(0)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Pencil className="w-4 h-4 mr-2" /> Редактировать
            </Button>
          </>
        ) : (
          <>
            {useWarehousePicker ? (
              <Button onClick={() => setShowMaterialPicker(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Шаблоны
              </Button>
            ) : onOpenTemplate ? (
              <Button onClick={onOpenTemplate} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Шаблоны
              </Button>
            ) : null}
            <Button onClick={onAddRow} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Добавить строку
            </Button>
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />{isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
              <X className="w-4 h-4 mr-2" /> Отмена
            </Button>
          </>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-12">#</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">{title}</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">Категория</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">Количество</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">Цена за ед. (₽)</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">Итого (₽)</th>
            {editIndex !== null && (
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-28">Действия</th>
            )}
          </tr>
        </thead>
        <tbody>{editIndex !== null ? editItems.map(renderRow) : items.map(renderRow)}</tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white" colSpan={5}>Итого</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">{total.toLocaleString('ru-RU')} ₽</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {useWarehousePicker && (
        <Modal isOpen={showMaterialPicker} onClose={() => setShowMaterialPicker(false)} title="Выбрать шаблон" maxWidth="max-w-4xl">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setMaterialTab('in-stock')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${materialTab === 'in-stock' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'}`}>
                <CheckCircle className="w-4 h-4" />В наличии<span className="ml-1 bg-white dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-xs">{inStockCount}</span>
              </button>
              <button onClick={() => setMaterialTab('ordered')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${materialTab === 'ordered' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'}`}>
                <Clock className="w-4 h-4" />Под заказ<span className="ml-1 bg-white dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-xs">{orderedCount}</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="w-5 h-5 text-gray-400 dark:text-slate-500" /></div>
              <input type="text" placeholder="Поиск по наименованию, категории..." value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} className="w-full pl-12 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredMaterials.map((material) => (
                <button key={material.id} onClick={() => { onApplyMaterial?.(material); setShowMaterialPicker(false); }} className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-green-50 hover:border-green-300 text-left transition-colors">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{material.name}</div>
                  <div className="text-xs text-gray-600 dark:text-slate-300">{material.quantity} {material.unit} × {material.price?.toLocaleString('ru-RU') || material.cost?.toLocaleString('ru-RU') || '0'} ₽</div>
                  {material.category && <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{material.category}</div>}
                </button>
              ))}
              {filteredMaterials.length === 0 && <div className="col-span-2 text-center py-4 text-gray-500 dark:text-slate-400 text-sm">Нет материалов</div>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
