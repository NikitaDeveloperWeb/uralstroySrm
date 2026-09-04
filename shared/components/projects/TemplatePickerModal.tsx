'use client';

import { useState } from 'react';
import { Trash2, X, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/button';

interface Template {
  id: number;
  name: string;
  quantity?: string;
  cost: number;
  category?: string | null;
}

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templates: Template[];
  onSelect: (template: Template) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  type?: 'material' | 'work' | 'overhead';
}

export function TemplatePickerModal({
  isOpen,
  onClose,
  title,
  templates,
  onSelect,
  onDelete,
  onAdd,
  type = 'material',
}: TemplatePickerModalProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/${type === 'overhead' ? 'project-overhead' : 'unit'}-rates/${id}`, {
        method: 'DELETE',
      });
      if (res.ok && onDelete) {
        onDelete(id);
      }
    } catch (err) {
      console.error('Failed to delete template', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddTemplate = async () => {
    if (!newName || !newCost) return;
    setSaving(true);
    try {
      const res = await fetch('/api/project-overhead-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          cost: Number(newCost),
          category: newCategory || null,
        }),
      });
      if (res.ok) {
        setNewName('');
        setNewCost('');
        setNewCategory('');
        setShowNewForm(false);
        if (onAdd) onAdd();
      }
    } catch (err) {
      console.error('Failed to add template', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-6xl">
      {/* Форма добавления нового шаблона */}
      {showNewForm && (
        <div className="mb-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Название</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название шаблона"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Стоимость (₽)</label>
              <input
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Категория</label>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Категория"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddTemplate}
                disabled={!newName || !newCost || saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? '...' : '✓'}
              </Button>
              <Button
                onClick={() => {
                  setShowNewForm(false);
                  setNewName('');
                  setNewCost('');
                  setNewCategory('');
                }}
                variant="outline"
                className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {templates.length === 0 && !showNewForm ? (
        <div className="text-center py-8 text-gray-500 dark:text-slate-400">Нет доступных шаблонов</div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <button
                onClick={(e) => handleDelete(e, template.id)}
                disabled={deletingId === template.id}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 disabled:opacity-50 z-10"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="w-full p-4 text-left"
              >
                <div className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</div>
                <div className="text-sm text-gray-600 dark:text-slate-300">
                  {template.quantity ? `${template.quantity} × ` : ''}
                  {template.cost.toLocaleString('ru-RU')} ₽
                </div>
                {template.category && (
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{template.category}</div>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Кнопка добавления */}
      <div className="mt-4 flex justify-center">
        {!showNewForm && (
          <Button
            onClick={() => setShowNewForm(true)}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Plus className="w-4 h-4 mr-2" /> Добавить шаблон
          </Button>
        )}
      </div>
    </Modal>
  );
}
