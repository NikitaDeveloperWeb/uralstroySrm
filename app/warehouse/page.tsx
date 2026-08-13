'use client';

import { useState } from 'react';
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  X,
} from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';



interface WarehouseItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdate: string;
  status: string;
}

interface MovementRecord {
  id: number;
  itemId: number;
  itemName: string;
  type: 'income' | 'expense';
  quantity: number;
  unit: string;
  date: string;
  comment: string;
  responsible: string;
}

const initialItems: WarehouseItem[] = [
  {
    id: 1,
    name: 'Кирпич красный М150',
    category: 'кирпич',
    quantity: 5000,
    unit: 'шт',
    location: 'Склад А, секция 1',
    lastUpdate: '2025-07-28',
    status: 'достаточно',
  },
  {
    id: 2,
    name: 'Цемент М500',
    category: 'цемент',
    quantity: 200,
    unit: 'кг',
    location: 'Склад Б, секция 3',
    lastUpdate: '2025-07-25',
    status: 'мало',
  },
  {
    id: 3,
    name: 'Доска обрезная 50x150x6000',
    category: 'дерево',
    quantity: 30,
    unit: 'м³',
    location: 'Склад В, секция 2',
    lastUpdate: '2025-07-20',
    status: 'достаточно',
  },
  {
    id: 4,
    name: 'Арматура А500С 12мм',
    category: 'металл',
    quantity: 0,
    unit: 'м²',
    location: 'Склад Г, секция 1',
    lastUpdate: '2025-07-15',
    status: 'нет в наличии',
  },
  {
    id: 5,
    name: 'Перфоратор Bosch GBH 2-26',
    category: 'инструменты',
    quantity: 3,
    unit: 'комплект',
    location: 'Склад А, секция 5',
    lastUpdate: '2025-07-29',
    status: 'критически мало',
  },
  {
    id: 6,
    name: 'Кирпич облицовочный',
    category: 'кирпич',
    quantity: 150,
    unit: 'шт',
    location: 'Склад А, секция 2',
    lastUpdate: '2025-07-27',
    status: 'мало',
  },
  {
    id: 7,
    name: 'Песок строительный',
    category: 'другие',
    quantity: 10,
    unit: 'м³',
    location: 'Склад Д, секция 1',
    lastUpdate: '2025-07-26',
    status: 'достаточно',
  },
  {
    id: 8,
    name: 'Профнастил С8',
    category: 'металл',
    quantity: 5,
    unit: 'м²',
    location: 'Склад Г, секция 3',
    lastUpdate: '2025-07-22',
    status: 'критически мало',
  },
];

const initialMovements: MovementRecord[] = [
  {
    id: 1,
    itemId: 1,
    itemName: 'Кирпич красный М150',
    type: 'income',
    quantity: 5000,
    unit: 'шт',
    date: '2025-07-20',
    comment: 'Поставка от СтройПоставка',
    responsible: 'Иванов А.П.',
  },
  {
    id: 2,
    itemId: 2,
    itemName: 'Цемент М500',
    type: 'income',
    quantity: 200,
    unit: 'кг',
    date: '2025-07-25',
    comment: 'Закупка у поставчика',
    responsible: 'Петров В.С.',
  },
  {
    id: 3,
    itemId: 3,
    itemName: 'Доска обрезная 50x150x6000',
    type: 'expense',
    quantity: 10,
    unit: 'м³',
    date: '2025-07-27',
    comment: 'Объект "Баня Ивана"',
    responsible: 'Сидоров Г.Д.',
  },
  {
    id: 4,
    itemId: 1,
    itemName: 'Кирпич красный М150',
    type: 'expense',
    quantity: 1500,
    unit: 'шт',
    date: '2025-07-28',
    comment: 'Объект "Дом Петров"',
    responsible: 'Козлов Е.А.',
  },
  {
    id: 5,
    itemId: 5,
    itemName: 'Перфоратор Bosch GBH 2-26',
    type: 'expense',
    quantity: 1,
    unit: 'комплект',
    date: '2025-07-29',
    comment: 'Выдача бригаде',
    responsible: 'Новов Ж.И.',
  },
];

const statusColors: Record<string, string> = {
  достаточно: 'bg-green-100 text-green-800',
  мало: 'bg-yellow-100 text-yellow-800',
  'критически мало': 'bg-orange-100 text-orange-800',
  'нет в наличии': 'bg-red-100 text-red-800',
};

const typeColors: Record<string, string> = {
  income: 'bg-green-100 text-green-800',
  expense: 'bg-red-100 text-red-800',
};

const typeLabels: Record<string, string> = {
  income: 'Приход',
  expense: 'Уход',
};

export default function WarehousePage() {
  const [items, setItems] = useState<WarehouseItem[]>(initialItems);
  const [movements, setMovements] = useState<MovementRecord[]>(initialMovements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [formData, setFormData] = useState<Partial<WarehouseItem>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [reportSearch, setReportSearch] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'reports'>('list');

  // Movement modal states
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'income' | 'expense'>('income');
  const [movementFormData, setMovementFormData] = useState<Partial<MovementRecord>>({
    itemId: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    responsible: '',
    comment: '',
  });

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredMovements = movements
    .filter((m) => reportFilter === 'all' || m.type === reportFilter)
    .filter(
      (m) =>
        m.itemName.toLowerCase().includes(reportSearch.toLowerCase()) ||
        m.responsible.toLowerCase().includes(reportSearch.toLowerCase()) ||
        m.comment.toLowerCase().includes(reportSearch.toLowerCase()),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filteredMovements
    .filter((m) => m.type === 'income')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalExpense = filteredMovements
    .filter((m) => m.type === 'expense')
    .reduce((sum, m) => sum + m.quantity, 0);

  const getItemById = (id: number) => items.find((i) => i.id === id);

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ category: 'кирпич', quantity: 0, unit: 'шт', status: 'достаточно' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? ({ ...item, ...formData } as WarehouseItem) : item,
        ),
      );
    } else {
      const newId = Math.max(...items.map((e) => e.id), 0) + 1;
      const newItem = { id: newId, ...formData } as WarehouseItem;
      setItems((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const openMovementModal = (type: 'income' | 'expense') => {
    setMovementType(type);
    setMovementFormData({
      itemId: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      responsible: '',
      comment: '',
    });
    setIsMovementModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!movementFormData.itemId || movementFormData.quantity === 0) return;

    const item = getItemById(movementFormData.itemId);
    if (!item) return;

    // Update item quantity
    if (movementType === 'income') {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === movementFormData.itemId) {
            const newQuantity = i.quantity + (movementFormData.quantity || 0);
            const newStatus =
              newQuantity === 0
                ? 'нет в наличии'
                : newQuantity < 10
                  ? 'критически мало'
                  : newQuantity < 100
                    ? 'мало'
                    : 'достаточно';
            return {
              ...i,
              quantity: newQuantity,
              lastUpdate: movementFormData.date || new Date().toISOString().split('T')[0],
              status: newStatus,
            };
          }
          return i;
        }),
      );
    } else {
      setItems((prev) =>
        prev.map((i) => {
          if (i.id === movementFormData.itemId) {
            const newQuantity = Math.max(0, i.quantity - (movementFormData.quantity || 0));
            const newStatus =
              newQuantity === 0
                ? 'нет в наличии'
                : newQuantity < 10
                  ? 'критически мало'
                  : newQuantity < 100
                    ? 'мало'
                    : 'достаточно';
            return {
              ...i,
              quantity: newQuantity,
              lastUpdate: movementFormData.date || new Date().toISOString().split('T')[0],
              status: newStatus,
            };
          }
          return i;
        }),
      );
    }

    // Add movement record
    const newMovement: MovementRecord = {
      id: Math.max(...movements.map((m) => m.id), 0) + 1,
      itemId: movementFormData.itemId!,
      itemName: item.name,
      type: movementType,
      quantity: movementFormData.quantity!,
      unit: item.unit,
      date: movementFormData.date!,
      comment: movementFormData.comment || '',
      responsible: movementFormData.responsible || '',
    };
    setMovements((prev) => [newMovement, ...prev]);
    setIsMovementModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Склад</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openMovementModal('income')}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <ArrowDownToLine className="w-4 h-4" />
            Приход
          </button>
          <button
            onClick={() => openMovementModal('expense')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <ArrowUpFromLine className="w-4 h-4" />
            Уход
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2">
        <button
          onClick={() => { setActiveView('list'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'list'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          <FileText className="w-4 h-4" />
          Список товаров
        </button>
        <button
          onClick={() => { setActiveView('reports'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'reports'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          <ArrowDownToLine className="w-4 h-4" />
          Отчёты
        </button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={activeView === 'reports' ? 'Поиск по отчётам...' : 'Поиск по названию, категории или местоположению...'}
          value={activeView === 'reports' ? reportSearch : searchQuery}
          onChange={(e) => activeView === 'reports' ? setReportSearch(e.target.value) : setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
        />
      </div>

      {activeView === 'list' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Наименование
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Категория
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                  Количество
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                  Ед. изм.
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Местоположение
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                  Обновлено
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                  Статус
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium">{item.name}</td>
                  <td className="py-4 px-6 text-gray-600">{item.category}</td>
                  <td className="py-4 px-6 text-gray-600 text-center">{item.quantity}</td>
                  <td className="py-4 px-6 text-gray-600 text-center">{item.unit}</td>
                  <td className="py-4 px-6 text-gray-600">{item.location}</td>
                  <td className="py-4 px-6 text-gray-600 text-center">{item.lastUpdate}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 transition-colors">
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

      {activeView === 'reports' && (
        <div className="space-y-6">
          {/* Фильтры отчётов */}
          <div className="flex gap-2">
            <button
              onClick={() => setReportFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportFilter === 'all'
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              Все
            </button>
            <button
              onClick={() => setReportFilter('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportFilter === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}>
              <ArrowDownToLine className="w-4 h-4 inline mr-1" />
              Приход
            </button>
            <button
              onClick={() => setReportFilter('expense')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportFilter === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}>
              <ArrowUpFromLine className="w-4 h-4 inline mr-1" />
              Уход
            </button>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1976d2]">
              <p className="text-sm text-gray-500 mb-1">Всего записей</p>
              <p className="text-2xl font-bold text-gray-900">{filteredMovements.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-500 mb-1">Общий приход</p>
              <p className="text-2xl font-bold text-green-600">{totalIncome}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <p className="text-sm text-gray-500 mb-1">Общий уход</p>
              <p className="text-2xl font-bold text-red-600">{totalExpense}</p>
            </div>
          </div>

          {/* Таблица отчётов */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Тип
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Наименование
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      Количество
                    </th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                      Ед. изм.
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Дата
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Ответственный
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Комментарий
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            movement.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {movement.type === 'income' ? (
                            <ArrowDownToLine className="w-3 h-3" />
                          ) : (
                            <ArrowUpFromLine className="w-3 h-3" />
                          )}
                          {movement.type === 'income' ? 'Приход' : 'Уход'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-medium">{movement.itemName}</td>
                      <td className="py-4 px-6 text-gray-600 text-center">
                        <span
                          className={
                            movement.type === 'income'
                              ? 'text-green-600 font-semibold'
                              : 'text-red-600 font-semibold'
                          }>
                          {movement.type === 'income' ? '+' : '-'}{movement.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-center">{movement.unit}</td>
                      <td className="py-4 px-6 text-gray-600">{movement.date}</td>
                      <td className="py-4 px-6 text-gray-600">{movement.responsible}</td>
                      <td className="py-4 px-6 text-gray-600">{movement.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredMovements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Отчёты не найдены</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setFormData({});
        }}
        title={editingItem ? 'Редактировать товар' : 'Новый товар'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
              <select
                value={formData.category || 'кирпич'}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="кирпич">Кирпич</option>
                <option value="цемент">Цемент</option>
                <option value="дерево">Дерево</option>
                <option value="металл">Металл</option>
                <option value="инструменты">Инструменты</option>
                <option value="другие">Другие</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={formData.status || 'достаточно'}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="достаточно">Достаточно</option>
                <option value="мало">Мало</option>
                <option value="критически мало">Критически мало</option>
                <option value="нет в наличии">Нет в наличии</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
              <input
                type="number"
                value={formData.quantity ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ед. изм.</label>
              <select
                value={formData.unit || 'шт'}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="шт">шт</option>
                <option value="м²">м²</option>
                <option value="м³">м³</option>
                <option value="кг">кг</option>
                <option value="комплект">комплект</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата обновления</label>
            <input
              type="date"
              value={formData.lastUpdate || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastUpdate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({});
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors">
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно движения товара */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementFormData({
            itemId: 0,
            quantity: 0,
            date: new Date().toISOString().split('T')[0],
            responsible: '',
            comment: '',
          });
        }}
        title={movementType === 'income' ? 'Приход товара' : 'Уход товара'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Товар</label>
            <select
              value={movementFormData.itemId || 0}
              onChange={(e) =>
                setMovementFormData((prev) => ({ ...prev, itemId: Number(e.target.value) }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
              <option value={0}>Выберите товар</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.quantity} {item.unit})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
              <input
                type="number"
                value={movementFormData.quantity || 0}
                onChange={(e) =>
                  setMovementFormData((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                type="date"
                value={movementFormData.date || ''}
                onChange={(e) =>
                  setMovementFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ответственный</label>
            <input
              type="text"
              value={movementFormData.responsible || ''}
              onChange={(e) =>
                setMovementFormData((prev) => ({ ...prev, responsible: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <input
              type="text"
              value={movementFormData.comment || ''}
              onChange={(e) =>
                setMovementFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveMovement}
              className={`flex-1 text-white py-3 px-4 rounded-lg font-semibold transition-colors ${
                movementType === 'income'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}>
              {movementType === 'income' ? 'Принять на склад' : 'Списать со склада'}
            </button>
            <button
              onClick={() => setIsMovementModalOpen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors">
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
