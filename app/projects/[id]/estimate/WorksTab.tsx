'use client';

import { useState, useEffect } from 'react';
import { EstimateTable } from '@/shared/components/estimates/EstimateTable';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import type { WorkTemplate } from '@/shared/stores/materialEstimateStore';
import type { ProjectCompletedWork } from '@/shared/types/project';

interface WorksTabProps {
  items: ProjectCompletedWork[];
  templates: WorkTemplate[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  projectId: number;
}

export function WorksTab({ items, templates, onSave, isSaving, projectId }: WorksTabProps) {
  const createCompletedWork = useMaterialEstimateStore(state => state.createCompletedWork);
  const updateCompletedWork = useMaterialEstimateStore(state => state.updateCompletedWork);
  const deleteCompletedWork = useMaterialEstimateStore(state => state.deleteCompletedWork);
  const fetchCompletedWorks = useMaterialEstimateStore(state => state.fetchCompletedWorks);

  const [editItems, setEditItems] = useState<ProjectCompletedWork[]>(() => [...items]);
  const [editing, setEditing] = useState(false);

  // Синхронизируем editItems с items, когда не в режиме редактирования
  useEffect(() => {
    if (!editing) {
      setEditItems([...items]);
    }
  }, [items, editing]);

  const handleApplyTemplate = async (template: { name: string; quantity: string; cost: number; category?: string | null }) => {
    // Если не в режиме редактирования — просто включаем его
    // editItems уже синхронизирован с items через useEffect
    if (!editing) {
      setEditing(true);
    }
    const newItem: ProjectCompletedWork = {
      id: Date.now(), // temporary ID
      projectId,
      name: template.name,
      quantity: template.quantity,
      cost: template.cost,
      category: template.category,
      createdAt: new Date().toISOString(),
    };
    setEditItems((prev: ProjectCompletedWork[]) => [...prev, newItem]);
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
      if (isExisting) {
        await deleteCompletedWork(item.id);
      }
    }
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const mergedItems = editing ? editItems : items;

  return (
    <EstimateTable
      items={mergedItems}
      templates={templates}
      title="Смета работ"
      itemLabel="Работа"
      onSave={editing ? handleSave : onSave}
      onAddRow={editing ? handleAddRow : () => {
        setEditing(true);
        handleAddRow();
      }}
      onApplyTemplate={handleApplyTemplate}
      onChange={handleChange}
      onRemoveRow={handleRemoveRow}
      isSaving={isSaving}
      isEditing={editing}
    />
  );
}
