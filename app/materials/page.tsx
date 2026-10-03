'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, FileText } from 'lucide-react';
import { MaterialList } from '@/shared/components/materials/MaterialList';
import { MaterialSearch } from '@/shared/components/materials/MaterialSearch';
import { MaterialTabs } from '@/shared/components/materials/MaterialTabs';
import { MaterialForm } from '@/shared/components/materials/MaterialForm';
import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useMaterialStore } from '@/shared/stores/materialStore';
import { useAlert } from '@/shared/hooks/useAlert';
import type { Material, CreateMaterialInput } from '@/shared/types/material';

export default function MaterialsPage() {
  const { materials, fetchMaterials, createMaterial, updateMaterial, deleteMaterial } = useMaterialStore();
  const [activeTab, setActiveTab] = useState<'in-stock' | 'ordered'>('in-stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const { confirm } = useAlert();

  const ITEMS_PER_PAGE = 20;

  // Загружаем ВСЕ материалы при монтировании
  useEffect(() => {
    fetchMaterials(1, 10000);
  }, [fetchMaterials]);

  // Фильтруем по вкладке
  const filteredByTab = useMemo(() => {
    if (activeTab === 'in-stock') return materials.filter(m => m.status === 'in-stock');
    return materials.filter(m => m.status === 'ordered');
  }, [materials, activeTab]);

  // Фильтруем по поиску
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return filteredByTab;
    return filteredByTab.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByTab, searchQuery]);

  // Пагинация
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBySearch.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBySearch, currentPage]);

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

  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/warehouse-items/export');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `materials_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Материалы</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            Экспорт в Excel
          </Button>
          <Button onClick={handleAdd} className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Добавить материал
          </Button>
        </div>
      </div>

      <MaterialTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />

      <MaterialSearch value={searchQuery} onChange={setSearchQuery} />

      <MaterialList
        materials={paginatedMaterials}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Пагинация */}
      {filteredBySearch.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredBySearch.length / ITEMS_PER_PAGE)}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          totalItems={filteredBySearch.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
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
