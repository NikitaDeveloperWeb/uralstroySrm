'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { Pencil, Save, X, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';
import type { Material } from '@/shared/types/material';
import { EditableCell } from './EditableCell';

interface EstimateItem {
  id?: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  stage?: string | null;
}

export interface TemplateItem {
  id: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
  isSystem?: boolean;
}

interface EstimateTableProps {
  items: EstimateItem[];
  templates: TemplateItem[];
  materials?: Material[];
  title: string;
  itemLabel: string;
  onSave: () => Promise<void>;
  onToggleEdit?: () => void;
  onDelete?: (id: number) => Promise<void>;
  onAddRow: () => void;
  onApplyTemplate: (template: TemplateItem) => void;
  onApplyMaterial: (material: Material) => void;
  onChange: (index: number, field: keyof EstimateItem, value: string | number) => void;
  onRemoveRow: (index: number) => void;
  isSaving: boolean;
  isEditing?: boolean;
}

function EstimateTableBase({
  items,
  templates,
  materials,
  title,
  itemLabel,
  onSave,
  onToggleEdit,
  onAddRow,
  onApplyTemplate,
  onApplyMaterial,
  onChange,
  onRemoveRow,
  isSaving,
  isEditing,
  onDelete,
}: EstimateTableProps) {
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const selectedRow = selectedRowIndex !== null ? items[selectedRowIndex] : null;
  const editMode = isEditing ?? false;

  const handleChange = useCallback((index: number, field: keyof EstimateItem, value: string | number) => {
    onChange(index, field, value);
  }, [onChange]);

  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  // Sort items by stage
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const stageA = a.stage || '';
      const stageB = b.stage || '';
      return stageA.localeCompare(stageB, 'ru');
    });
  }, [items]);

  // Фильтрация материалов
  const [materialTab, setMaterialTab] = useState<'in-stock' | 'ordered'>('in-stock');
  const [materialSearch, setMaterialSearch] = useState('');

  const filteredMaterials = useMemo(() => (materials || [])
    .filter(m => m.status === materialTab)
    .filter(m => 
      m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(materialSearch.toLowerCase())
    ), [materials, materialTab, materialSearch]);

  const inStockCount = useMemo(() => (materials || []).filter(m => m.status === 'in-stock').length, [materials]);
  const orderedCount = useMemo(() => (materials || []).filter(m => m.status === 'ordered').length, [materials]);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700">
          🖨 Печать
        </Button>
        {editMode ? (
          <>
            <Button
              onClick={() => setShowTemplatePicker(true)}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50">
              <Plus className="w-4 h-4 mr-2" /> Из шаблонов
            </Button>
            {materials && (
              <Button
                onClick={() => {
                  setShowTemplatePicker(true);
                  setTimeout(() => {
                    const materialsTab = document.getElementById('materials-tab');
                    if (materialsTab) materialsTab.click();
                  }, 100);
                }}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Из материалов
            </Button>
            )}
            {onToggleEdit && (
              <Button
                onClick={onToggleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                <Pencil className="w-4 h-4 mr-2" />
                Готово
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={() => setShowTemplatePicker(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white">
              📑 Шаблоны
            </Button>
            {onToggleEdit && (
              <Button
                onClick={onToggleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white">
                <Pencil className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            )}
          </>
        )}
      </div>

      {/* Table with delegated events */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-12">#</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300">
                {itemLabel}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">
                Категория
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-32">
                Количество
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-40">
                Этап
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-slate-300 w-36">
                Стоимость (₽)
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => {
              return (
                <tr
                  key={item.id != null ? `item-${item.id}` : `row-${index}`}
                  className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 ${
                    editMode && selectedRowIndex === index ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => editMode && setSelectedRowIndex(index)}
                >
                <td className="py-3 px-4 text-gray-400 dark:text-slate-500 text-sm">{index + 1}</td>
                <td className="py-3 px-4">
                  {editMode ? (
                    <EditableCell
                      value={item.name}
                      field="name"
                      index={index}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">{item.name}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editMode ? (
                    <EditableCell
                      value={item.category || ''}
                      field="category"
                      index={index}
                      onChange={handleChange}
                      placeholder="Категория"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-slate-300 text-sm">
                      {item.category || '—'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {editMode ? (
                    <EditableCell
                      value={item.quantity}
                      field="quantity"
                      index={index}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-slate-300">{item.quantity}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editMode ? (
                    <EditableCell
                      value={item.stage || ''}
                      field="stage"
                      index={index}
                      onChange={handleChange}
                      placeholder="Этап"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600 dark:text-slate-300 text-sm">
                      {item.stage || '—'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {editMode ? (
                    <EditableCell
                      value={item.cost}
                      field="cost"
                      index={index}
                      onChange={handleChange}
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.cost?.toLocaleString('ru-RU') || '0'}
                    </span>
                  )}
                </td>
              </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-slate-400">
                  Нет данных. Нажмите «Добавить строку» или выберите шаблон/материал.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
              <td className="py-3 px-4 font-bold text-gray-900 dark:text-white" colSpan={3}>
                Итого
              </td>
              <td className="py-3 px-4"></td>
              <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">
                {totalCost.toLocaleString('ru-RU')} ₽
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Category summary */}
      {categories.length > 0 && !editMode && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Разбивка по категориям:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categories.map((cat) => {
              const catTotal = items
                .filter((item) => item.category === cat)
                .reduce((sum, item) => sum + (item.cost || 0), 0);
              return (
                <div key={cat} className="flex justify-between text-gray-600 dark:text-slate-300">
                  <span>{cat}</span>
                  <span className="font-medium">{catTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyboard handler for delete */}
      {editMode && selectedRowIndex !== null && (
        <div
          tabIndex={0}
          className="outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Delete') {
              onRemoveRow(selectedRowIndex);
              setSelectedRowIndex(null);
            }
          }}>
        </div>
      )}

      {/* Template picker modal */}
      <Modal
        isOpen={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        title={`Выбрать — ${title}`}
        maxWidth="w-[95vw]"
        maxHeight="max-h-[95vh]">
        <div className="space-y-4">
          {/* Materials section with tabs */}
          {materials && materials.length > 0 && (
            <div className="border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-2 mb-4">
                <button
                  id="materials-tab"
                  onClick={() => setMaterialTab('in-stock')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    materialTab === 'in-stock'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'
                  }`}>
                  <CheckCircle className="w-4 h-4" />
                  В наличии
                  <span className="ml-1 bg-white dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-xs">
                    {inStockCount}
                  </span>
                </button>
                <button
                  onClick={() => setMaterialTab('ordered')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    materialTab === 'ordered'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700'
                  }`}>
                  <Clock className="w-4 h-4" />
                  Под заказ
                  <span className="ml-1 bg-white dark:bg-slate-800/20 px-2 py-0.5 rounded-full text-xs">
                    {orderedCount}
                  </span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Поиск по наименованию, категории..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>

              {/* Materials grid */}
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      onApplyMaterial(material);
                      setShowTemplatePicker(false);
                    }}
                    className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition-colors">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{material.name}</div>
                    <div className="text-xs text-gray-600 dark:text-slate-300">
                      {material.quantity} {material.unit} × {material.cost?.toLocaleString('ru-RU')} ₽
                    </div>
                    {material.category && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{material.category}</div>
                    )}
                  </button>
                ))}
                {filteredMaterials.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-gray-500 dark:text-slate-400 text-sm">
                    Нет материалов
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates section */}
          {templates.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Статические шаблоны</h3>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onApplyTemplate(template);
                      setShowTemplatePicker(false);
                    }}
                    className="p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 text-left transition-colors">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-gray-600 dark:text-slate-300">
                      {template.quantity} × {template.cost.toLocaleString('ru-RU')} ₽
                    </div>
                    {template.category && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{template.category}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!materials || materials.length === 0) && templates.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              Нет доступных шаблонов и материалов
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export const EstimateTable = memo(EstimateTableBase);
