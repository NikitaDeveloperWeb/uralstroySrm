'use client';

import { useState, useEffect } from 'react';
import { EstimateTable } from '@/shared/components/estimates/EstimateTable';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import type { MaterialTemplate } from '@/shared/stores/materialEstimateStore';
import type { ProjectMaterial } from '@/shared/types/project';
import type { Material } from '@/shared/types/material';

interface MaterialsTabProps {
  items: ProjectMaterial[];
  templates: MaterialTemplate[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  projectId: number;
}

export function MaterialsTab({ items, templates, onSave, isSaving, projectId }: MaterialsTabProps) {
  console.log('=== MaterialsTab rendered ===', { items, templates, projectId });
  const createMaterialEstimate = useMaterialEstimateStore(state => state.createMaterialEstimate);
  const updateMaterialEstimate = useMaterialEstimateStore(state => state.updateMaterialEstimate);
  const deleteMaterialEstimate = useMaterialEstimateStore(state => state.deleteMaterialEstimate);
  const fetchMaterialEstimates = useMaterialEstimateStore(state => state.fetchMaterialEstimates);
  const materials = useMaterialEstimateStore(state => state.materials);
  const fetchMaterials = useMaterialEstimateStore(state => state.fetchMaterials);

  const [editItems, setEditItems] = useState<ProjectMaterial[]>(() => [...items]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    if (!editing) {
      setEditItems([...items]);
    }
  }, [items, editing]);

  const handleApplyTemplate = async (template: { name: string; quantity: string; cost: number; category?: string | null }) => {
    if (!editing) {
      setEditing(true);
    }
    const newItem: ProjectMaterial = {
      id: Date.now(),
      projectId,
      name: template.name,
      quantity: template.quantity,
      cost: template.cost,
      category: template.category,
      createdAt: new Date().toISOString(),
    };
    setEditItems((prev) => [...prev, newItem]);
  };

  const handleApplyMaterial = (material: Material) => {
    if (!editing) {
      setEditing(true);
    }
    const newItem: ProjectMaterial = {
      id: Date.now(),
      projectId,
      name: material.name,
      quantity: `${material.quantity} ${material.unit}`,
      cost: material.cost || 0,
      category: material.category,
      createdAt: new Date().toISOString(),
    };
    setEditItems((prev) => [...prev, newItem]);
  };

  const handleSave = async () => {
    setEditing(false);
    try {
      const existingIds = new Set(items.map(i => i.id));
      const newIds = new Set(editItems.map(i => i.id).filter(id => !existingIds.has(id)));
      
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
      materials={materials}
      title="Смета материалов"
      itemLabel="Материал"
      onSave={editing ? handleSave : onSave}
      onToggleEdit={() => setEditing(prev => !prev)}
      onAddRow={editing ? handleAddRow : () => {
        setEditing(true);
        handleAddRow();
      }}
      onApplyTemplate={handleApplyTemplate}
      onApplyMaterial={handleApplyMaterial}
      onChange={handleChange}
      onRemoveRow={handleRemoveRow}
      isSaving={isSaving}
      isEditing={editing}
    />
  );
}
