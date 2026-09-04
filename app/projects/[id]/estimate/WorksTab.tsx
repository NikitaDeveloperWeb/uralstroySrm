'use client';

import { useState, useEffect, useMemo } from 'react';
import { EstimateTable } from '@/shared/components/estimates/EstimateTable';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import type { UnitRate } from '@/shared/stores/materialEstimateStore';

interface CombinedWorkTemplate {
  id: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string;
  unit?: string;
  pricePerUnit?: number;
}
import type { ProjectCompletedWork } from '@/shared/types/project';

interface WorksTabProps {
  items: ProjectCompletedWork[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  projectId: number;
}

export function WorksTab({ items, onSave, isSaving, projectId }: WorksTabProps) {
  const { surveyUnitRates, fetchSurveyUnitRates, createCompletedWork, updateCompletedWork, deleteCompletedWork, fetchCompletedWorks } = useMaterialEstimateStore();
  
  const [editItems, setEditItems] = useState<ProjectCompletedWork[]>(() => [...items]);
  const [editing, setEditing] = useState(false);
  const [searchTemplate, setSearchTemplate] = useState('');

  useEffect(() => {
    fetchSurveyUnitRates('client');
  }, [fetchSurveyUnitRates]);

  useEffect(() => {
    if (!editing) setEditItems([...items]);
  }, [items, editing]);

  // Берём только unit rates (вашу таблицу видов работ)
  const combinedTemplates: CombinedWorkTemplate[] = useMemo(() => {
    return surveyUnitRates.map(ur => ({
      id: ur.id,
      name: ur.name,
      quantity: ur.unit || 'м²',
      cost: Math.round(ur.pricePerUnit),
      category: ur.category || undefined,
      unit: ur.unit,
    }));
  }, [surveyUnitRates]);

  // Фильтрация шаблонов для поиска
  const filteredTemplates = useMemo(() => {
    if (!searchTemplate) return combinedTemplates;
    const query = searchTemplate.toLowerCase();
    return combinedTemplates.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category?.toLowerCase().includes(query)
    );
  }, [combinedTemplates, searchTemplate]);

  const handleApplyTemplate = async (template: CombinedWorkTemplate) => {
    if (!editing) setEditing(true);
    
    const newItem: ProjectCompletedWork = {
      id: Date.now(),
      projectId,
      name: template.name,
      quantity: template.quantity,
      cost: template.cost,
      category: template.category || null,
      createdAt: new Date().toISOString(),
    };
    setEditItems(prev => [...prev, newItem]);
    setSearchTemplate('');
  };

  const handleSave = async () => {
    setEditing(false);
    try {
      const existingIds = new Set(items.map(i => i.id));
      
      for (const item of editItems) {
        if (item.id && !existingIds.has(item.id)) {
          await createCompletedWork({
            projectId,
            name: item.name,
            quantity: item.quantity,
            cost: item.cost,
            category: item.category || undefined,
          });
        }
      }
      
      for (const item of editItems) {
        if (item.id && existingIds.has(item.id)) {
          const original = items.find(i => i.id === item.id);
          if (original && (original.name !== item.name || original.quantity !== item.quantity || original.cost !== item.cost || original.category !== item.category)) {
            await updateCompletedWork(item.id, {
              name: item.name,
              quantity: item.quantity,
              cost: item.cost,
              category: item.category || undefined,
            });
          }
        }
      }
      
      for (const item of items) {
        if (!editItems.some(e => e.id === item.id)) {
          await deleteCompletedWork(item.id);
        }
      }
      
      await fetchCompletedWorks(projectId);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleChange = (index: number, field: keyof ProjectCompletedWork, value: string | number) => {
    const copy = [...editItems];
    copy[index] = { ...copy[index], [field]: value };
    setEditItems(copy);
  };

  const handleAddRow = () => {
    setEditItems([...editItems, {
      id: Date.now(),
      projectId,
      name: '',
      quantity: '',
      cost: 0,
      category: null,
      createdAt: new Date().toISOString(),
    }]);
  };

  const handleRemoveRow = async (index: number) => {
    const item = editItems[index];
    if (item?.id) {
      const isExisting = items.some(i => i.id === item.id);
      if (isExisting) await deleteCompletedWork(item.id);
    }
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const mergedItems = editing ? editItems : items;

  return (
    <div className="space-y-4">
      {/* Поиск шаблонов */}
      {editing && (
        <div className="space-y-2">
          <input
            type="text"
            value={searchTemplate}
            onChange={e => setSearchTemplate(e.target.value)}
            placeholder="Поиск по названию или категории..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
          
          {/* Выпадающий список шаблонов */}
          {searchTemplate && filteredTemplates.length > 0 && (
            <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-800 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg shadow-lg">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white dark:text-white">{template.name}</div>
                      {template.category && (
                        <div className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">{template.category}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1976d2]">
                        {template.cost.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400">за {template.quantity}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Рекомендованные шаблоны */}
          {!searchTemplate && combinedTemplates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {combinedTemplates.slice(0, 8).map(template => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  {template.name} — {template.cost} ₽/{template.quantity}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <EstimateTable
        items={mergedItems}
        templates={[]}
        materials={[]}
        title="Смета работ"
        itemLabel="Работа"
        onSave={editing ? handleSave : onSave}
        onToggleEdit={() => setEditing(prev => !prev)}
        onAddRow={editing ? handleAddRow : () => { setEditing(true); handleAddRow(); }}
        onApplyTemplate={() => {}}
        onApplyMaterial={() => {}}
        onChange={handleChange}
        onRemoveRow={handleRemoveRow}
        isSaving={isSaving}
        isEditing={editing}
      />
    </div>
  );
}
