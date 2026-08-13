'use client';

import { useState } from 'react';
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';

interface EstimateItem {
  id?: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string | null;
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
  title: string;
  itemLabel: string;
  onSave: () => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onAddRow: () => void;
  onApplyTemplate: (template: TemplateItem) => void;
  onChange: (index: number, field: keyof EstimateItem, value: string | number) => void;
  onRemoveRow: (index: number) => void;
  isSaving: boolean;
  isEditing?: boolean;
}

export function EstimateTable({
  items,
  templates,
  title,
  itemLabel,
  onSave,
  onAddRow,
  onApplyTemplate,
  onChange,
  onRemoveRow,
  isSaving,
  isEditing,
  onDelete,
}: EstimateTableProps) {
  const [editMode, setEditMode] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const selectedRow = selectedRowIndex !== null ? items[selectedRowIndex] : null;

  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50">
          🖨 Печать
        </Button>
        {!editMode ? (
          <>
            <Button
              onClick={() => setShowTemplatePicker(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white">
              📑 Шаблоны
            </Button>
            <Button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onAddRow}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50">
              <Plus className="w-4 h-4 mr-2" /> Добавить строку
            </Button>
            <Button
              onClick={async () => {
                await onSave();
                setEditMode(false);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              onClick={() => {
                if (selectedRow?.id) {
                  onRemoveRow(selectedRowIndex!);
                  setSelectedRowIndex(null);
                }
              }}
              disabled={selectedRowIndex === null}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <Trash2 className="w-4 h-4 mr-2" /> Удалить
            </Button>
            <Button
              onClick={() => setEditMode(false)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <X className="w-4 h-4 mr-2" /> Отмена
            </Button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">#</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                {itemLabel}
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                Категория
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                Количество
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-36">
                Стоимость (₽)
              </th>

            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id ?? index}
                className={`border-b border-gray-100 hover:bg-gray-50 ${
                  editMode && selectedRowIndex === index ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                }`}
                onClick={() => editMode && setSelectedRowIndex(index)}
              >
                <td className="py-3 px-4 text-gray-400 text-sm">{index + 1}</td>
                <td className="py-3 px-4">
                  {editMode ? (
                    <input
                      value={item.name}
                      onChange={(e) => onChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{item.name}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editMode ? (
                    <input
                      value={item.category || ''}
                      onChange={(e) => onChange(index, 'category', e.target.value)}
                      placeholder="Категория"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm">
                      {item.category || '—'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {editMode ? (
                    <input
                      value={item.quantity}
                      onChange={(e) => onChange(index, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  ) : (
                    <span className="text-gray-600">{item.quantity}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {editMode ? (
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) => onChange(index, 'cost', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">
                      {item.cost?.toLocaleString('ru-RU') || '0'}
                    </span>
                  )}
                </td>

              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  Нет данных. Нажмите «Добавить строку» или выберите шаблон.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
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
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Разбивка по категориям:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {categories.map((cat) => {
              const catTotal = items
                .filter((item) => item.category === cat)
                .reduce((sum, item) => sum + (item.cost || 0), 0);
              return (
                <div key={cat} className="flex justify-between text-gray-600">
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
        title={`Выбрать шаблон — ${title}`}
        maxWidth="max-w-4xl">
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Нет доступных шаблонов
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onApplyTemplate(template);
                  setShowTemplatePicker(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition-colors">
                <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                <div className="text-sm text-gray-600">
                  {template.quantity} × {template.cost.toLocaleString('ru-RU')} ₽
                </div>
                {template.category && (
                  <div className="text-xs text-gray-500 mt-1">{template.category}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
