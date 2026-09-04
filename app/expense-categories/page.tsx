'use client';

import { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';

interface ExpenseCategory {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { alert, confirm } = useAlert();

  useEffect(() => {
    fetch('/api/expense-categories')
      .then(res => res.json())
      .then(data => setCategories(data?.data || []))
      .catch(err => console.error('Failed to fetch categories:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить эту категорию?'))) return;
    try {
      await fetch(`/api/expense-categories/${id}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = '';
    }, 0);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = category.name;
    }, 0);
  };

  const handleSave = async () => {
    try {
      const name = nameRef.current?.value?.trim() || '';

      if (!name) {
        alert('Укажите название');
        return;
      }

      if (editingCategory) {
        await fetch(`/api/expense-categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        setCategories(prev => prev.map(cat =>
          cat.id === editingCategory.id ? { ...cat, name } : cat
        ));
      } else {
        const res = await fetch('/api/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const newCategory = await res.json();
        setCategories(prev => [...prev, newCategory.data]);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  useEffect(() => {
    if (!isModalOpen) {
      if (nameRef.current) nameRef.current.value = '';
    }
  }, [isModalOpen]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Категории расходов</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить категорию
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                    <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{category.name}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {filteredCategories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredCategories.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        title={editingCategory ? 'Редактировать категорию' : 'Новая категория'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название</label>
            <input ref={nameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Бензин/ГСМ" />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setEditingCategory(null); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
