'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Plus, DollarSign } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { useUnitRateStore } from '@/shared/stores/unitRateStore';
import type { UnitRate } from '@/shared/types/unitRate';

export default function WorkTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<UnitRate | null>(null);
  const [formData, setFormData] = useState<Partial<UnitRate>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Zustand store
  const {
    unitRates: storeRates,
    loading,
    error,
    fetchUnitRates,
    createUnitRate,
    updateUnitRate,
    deleteUnitRate,
  } = useUnitRateStore();

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchUnitRates(filterCategory || undefined);
  }, [fetchUnitRates, filterCategory]);

  const filteredRates = storeRates.filter(rate =>
    rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rate.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(storeRates.map(r => r.category)));

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту расценку?')) return;
    try {
      await deleteUnitRate(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления расценки');
    }
  };

  const handleAdd = () => {
    setEditingRate(null);
    setFormData({ unit: 'м²', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (rate: UnitRate) => {
    setEditingRate(rate);
    setFormData({ ...rate });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.category || formData.pricePerUnit === undefined) {
        alert('Заполните название, категорию и цену');
        return;
      }

      const rateData = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit || 'м²',
        pricePerUnit: formData.pricePerUnit,
        description: formData.description || null,
        isActive: formData.isActive ?? true,
      };

      if (editingRate) {
        await updateUnitRate(editingRate.id, rateData);
      } else {
        await createUnitRate(rateData);
      }
      setIsModalOpen(false);
      setEditingRate(null);
      setFormData({});
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения расценки');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Расценки по квадратуре</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить расценку
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Загрузка...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Название</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Категория</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Единица</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Цена за м²</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Описание</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Статус</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-900 font-medium">{rate.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rate.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">{rate.unit}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {rate.pricePerUnit.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">{rate.description || '—'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        rate.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rate.isActive ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Редактировать"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Удалить"
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
        </div>
      )}

      {!loading && !error && filteredRates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Расценки не найдены</p>
        </div>
      )}

      {/* Модалка добавления/редактирования расценки */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRate(null); setFormData({}); }}
        title={editingRate ? 'Редактировать расценку' : 'Новая расценка'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Сосна, Липа, Каркас"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="Например: Деревянные конструкции"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Единица измерения</label>
              <select
                value={formData.unit || 'м²'}
                onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="м²">м²</option>
                <option value="м³">м³</option>
                <option value="м">м</option>
                <option value="шт">шт</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена за {formData.unit || 'м²'}</label>
            <input
              type="number"
              value={formData.pricePerUnit || ''}
              onChange={e => setFormData(prev => ({ ...prev, pricePerUnit: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              rows={3}
              placeholder="Опциональное описание"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive ?? true}
              onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Активна</label>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setEditingRate(null); setFormData({}); }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
