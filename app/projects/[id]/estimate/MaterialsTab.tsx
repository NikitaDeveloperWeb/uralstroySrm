'use client';

import { useState, useEffect } from 'react';
import { EstimateTable } from '@/shared/components/estimates/EstimateTable';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import type { MaterialTemplate } from '@/shared/stores/materialEstimateStore';
import type { ProjectMaterial } from '@/shared/types/project';

interface MaterialsTabProps {
  items: ProjectMaterial[];
  templates: MaterialTemplate[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  projectId: number;
}

export function MaterialsTab({ items, templates, onSave, isSaving, projectId }: MaterialsTabProps) {
  const createMaterialEstimate = useMaterialEstimateStore(state => state.createMaterialEstimate);
  const updateMaterialEstimate = useMaterialEstimateStore(state => state.updateMaterialEstimate);
  const deleteMaterialEstimate = useMaterialEstimateStore(state => state.deleteMaterialEstimate);
  const fetchMaterialEstimates = useMaterialEstimateStore(state => state.fetchMaterialEstimates);

  const [editItems, setEditItems] = useState<ProjectMaterial[]>(() => [...items]);
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
    const newItem: ProjectMaterial = {
      id: Date.now(), // temporary ID
      projectId,
      name: template.name,
      quantity: template.quantity,
      cost: template.cost,
      category: template.category,
      createdAt: new Date().toISOString(),
    };
    setEditItems((prev: ProjectMaterial[]) => [...prev, newItem]);
  };

  const handleSave = async () => {
    setEditing(false);
    try {
      // Sync with DB
      const existingIds = new Set(items.map(i => i.id));
      const newIds = new Set(editItems.map(i => i.id).filter(id => !existingIds.has(id)));
      
      // Create new items
      for (const item of editItems) {
        if (item.id && !existingIds.has(item.id)) {
          await createMaterialEstimate({
            projectId,
            name: item.name,
            quantity: item.quantity,
            cost: item.cost,
            category: item.category || undefined,
          });
        }
      }
      
      // Update changed items
      for (const item of editItems) {
        if (item.id && existingIds.has(item.id)) {
          const original = items.find(i => i.id === item.id);
          if (original && (original.name !== item.name || original.quantity !== item.quantity || original.cost !== item.cost || original.category !== item.category)) {
            await updateMaterialEstimate(item.id, {
              name: item.name,
              quantity: item.quantity,
              cost: item.cost,
              category: item.category || undefined,
            });
          }
        }
      }
      
      // Delete removed items
      for (const item of items) {
        if (!editItems.some(e => e.id === item.id)) {
          await deleteMaterialEstimate(item.id);
        }
      }
      
      await fetchMaterialEstimates(projectId);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleChange = (index: number, field: keyof ProjectMaterial, value: string | number) => {
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
        await deleteMaterialEstimate(item.id);
      }
    }
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const mergedItems = editing ? editItems : items;

  return (
    <EstimateTable
      items={mergedItems}
      templates={templates}
      title="Смета материалов"
      itemLabel="Материал"
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
