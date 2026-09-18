'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { MaterialList } from '@/shared/components/materials/MaterialList';
import { MaterialSearch } from '@/shared/components/materials/MaterialSearch';
import { MaterialTabs } from '@/shared/components/materials/MaterialTabs';
import { MaterialForm } from '@/shared/components/materials/MaterialForm';
import { Button } from '@/shared/components/ui/button';
import { useMaterialStore } from '@/shared/stores/materialStore';
import { useAlert } from '@/shared/hooks/useAlert';
import type { Material, CreateMaterialInput } from '@/shared/types/material';

export default function MaterialsPage() {
  const { materials, fetchMaterials, createMaterial, updateMaterial, deleteMaterial } = useMaterialStore();
  const [activeTab, setActiveTab] = useState<'in-stock' | 'ordered'>('in-stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { confirm } = useAlert();

  useEffect(() => {
    // Загружаем все материалы без пагинации
    fetchMaterials(1, 1000, activeTab);
  }, [activeTab, fetchMaterials]);

  const filteredMaterials = materials
    .filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const counts = {
    'in-stock': materials.filter((m) => m.status === 'in-stock').length,
    'ordered': materials.filter((m) => m.status === 'ordered').length,
  };

  const handleAdd = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить материал?'))) return;
    await deleteMaterial(id);
  };

  const handleSubmit = async (data: CreateMaterialInput) => {
    if (editingMaterial) {
      await updateMaterial(editingMaterial.id, data);
    } else {
      await createMaterial(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Материалы</h1>
        <Button onClick={handleAdd} className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Добавить материал
        </Button>
      </div>

      <MaterialTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

      <MaterialSearch value={searchQuery} onChange={setSearchQuery} />

      <MaterialList
        materials={filteredMaterials}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Информация о количестве */}
      {materials.length > 0 && (
        <div className="text-center py-2 text-sm text-gray-500 dark:text-slate-400">
          Всего материалов: {materials.length}
        </div>
      )}

      <MaterialForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        editingMaterial={editingMaterial}
      />
    </div>
  );
}
