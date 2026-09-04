'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useUnitRateStore } from '@/shared/stores/unitRateStore';
import { useAlert } from '@/shared/hooks/useAlert';
import type { UnitRate } from '@/shared/types/unitRate';

type TargetType = 'client' | 'employee';

const targetTypeLabels: Record<TargetType, string> = {
  client: 'Для клиентов',
  employee: 'Для сотрудников',
};

export default function WorkTypesPage() {
  const [activeTab, setActiveTab] = useState<TargetType>('client');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<UnitRate | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    unit: 'м²',
    clientPrice: '',
    employeePrice: '',
    description: '',
    isActive: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const clientPriceRef = useRef<HTMLInputElement>(null);
  const employeePriceRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { alert, confirm } = useAlert();

  const { unitRates: storeRates, loading, error, fetchUnitRates, createUnitRate, updateUnitRate, deleteUnitRate } = useUnitRateStore();

  useEffect(() => {
    fetchUnitRates(filterCategory || undefined, activeTab);
  }, [fetchUnitRates, filterCategory, activeTab]);

  useEffect(() => {
    if (!isModalOpen) {
      if (nameRef.current) nameRef.current.value = '';
      if (categoryRef.current) categoryRef.current.value = '';
      if (clientPriceRef.current) clientPriceRef.current.value = '';
      if (employeePriceRef.current) employeePriceRef.current.value = '';
      if (descriptionRef.current) descriptionRef.current.value = '';
    }
  }, [isModalOpen]);

  const filteredRates = storeRates.filter(rate =>
    rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rate.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const paginatedRates = filteredRates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory]);

  const categories = Array.from(new Set(storeRates.map(r => r.category)));

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить эту расценку?'))) return;
    try {
      await deleteUnitRate(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления расценки');
    }
  };

  const handleAdd = () => {
    setEditingRate(null);
    setForm({ name: '', category: '', unit: 'м²', clientPrice: '', employeePrice: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (rate: UnitRate) => {
    setEditingRate(rate);
    setForm({
      name: rate.name,
      category: rate.category,
      unit: rate.unit || 'м²',
      clientPrice: String(rate.pricePerUnit),
      employeePrice: String(rate.pricePerUnit),
      description: rate.description || '',
      isActive: rate.isActive,
    });
    setIsModalOpen(true);
    setTimeout(() => {
      if (nameRef.current) nameRef.current.value = rate.name;
      if (categoryRef.current) categoryRef.current.value = rate.category;
      if (clientPriceRef.current) clientPriceRef.current.value = String(rate.pricePerUnit);
      if (employeePriceRef.current) employeePriceRef.current.value = String(rate.pricePerUnit);
      if (descriptionRef.current) descriptionRef.current.value = rate.description || '';
    }, 0);
  };

  const handleSave = async () => {
    try {
      const name = nameRef.current?.value || '';
      const category = categoryRef.current?.value || '';
      const unit = form.unit;
      const clientPrice = clientPriceRef.current?.value === '' ? 0 : parseFloat(clientPriceRef.current?.value || '0');
      const employeePrice = employeePriceRef.current?.value === '' ? 0 : parseFloat(employeePriceRef.current?.value || '0');
      const description = descriptionRef.current?.value || '';

      if (!name || !category || isNaN(clientPrice)) {
        alert('Заполните название, категорию и цену');
        return;
      }

      if (editingRate) {
        await updateUnitRate(editingRate.id, {
          name,
          category,
          unit,
          pricePerUnit: clientPrice,
          targetType: editingRate.targetType,
          description: description || null,
          isActive: form.isActive,
        });
      } else {
        await createUnitRate({
          name,
          category,
          unit,
          pricePerUnit: clientPrice,
          targetType: 'client',
          description: description || null,
          isActive: true,
        });
        await createUnitRate({
          name,
          category,
          unit,
          pricePerUnit: employeePrice,
          targetType: 'employee',
          description: description || null,
          isActive: true,
        });
      }
      setIsModalOpen(false);
      setEditingRate(null);
      setForm({ name: '', category: '', unit: 'м²', clientPrice: '', employeePrice: '', description: '', isActive: true });
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения расценки');
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и табы */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Расценки по квадратуре</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить расценку
        </button>
      </div>

      {/* Табы */}
      <div className="flex gap-2">
        {(['client', 'employee'] as TargetType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === type
                ? 'bg-[#1976d2] text-white'
                : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-700 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
            }`}
          >
            {targetTypeLabels[type]}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">При добавлении новой позиции создаются расценки и для клиентов, и для сотрудников</p>

      {/* Фильтры */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-lg">Загрузка...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Категория</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Единица</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Цена за {form.unit || 'м²'}</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Описание</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Статус</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                    <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{rate.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {rate.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600 dark:text-slate-300 dark:text-slate-300">{rate.unit}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900 dark:text-white dark:text-white">
                      {rate.pricePerUnit.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 text-sm">{rate.description || '—'}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        rate.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300'
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRates.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {!loading && !error && filteredRates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-lg">Расценки не найдены</p>
        </div>
      )}

      {/* Модалка */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingRate(null); setForm({ name: '', category: '', unit: 'м²', clientPrice: '', employeePrice: '', description: '', isActive: true }); }}
        title={editingRate ? 'Редактировать расценку' : 'Новая расценка'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название</label>
            <input
              ref={nameRef}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Обшивка вагонкой"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Категория</label>
              <input
                ref={categoryRef}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="Например: Отделочные работы"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Единица измерения</label>
              <select
                value={form.unit}
                onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="м²">м²</option>
                <option value="м³">м³</option>
                <option value="м">м</option>
                <option value="шт">шт</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Цена для клиента за {form.unit || 'м²'}</label>
              <input
                ref={clientPriceRef}
                type="number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Цена для сотрудника за {form.unit || 'м²'}</label>
              <input
                ref={employeePriceRef}
                type="number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500">Сотрудники получают обычно меньшую ставку (сдельная оплата за м²)</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Описание</label>
            <textarea
              ref={descriptionRef}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              rows={3}
              placeholder="Опциональное описание"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 dark:border-slate-600 dark:border-slate-600 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-slate-300 dark:text-slate-300">Активна</label>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setEditingRate(null); setForm({ name: '', category: '', unit: 'м²', clientPrice: '', employeePrice: '', description: '', isActive: true }); }}
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