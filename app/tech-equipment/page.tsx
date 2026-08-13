'use client';

import { useState } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';

interface Equipment {
  id: number;
  name: string;
  type: string;
  inventoryNumber: string;
  status: 'in-use' | 'warehouse' | 'repair';
  location: string;
  acquisitionDate: string;
}

const initialEquipment: Equipment[] = [
  { id: 1, name: 'Экскаватор CAT 320', type: 'Экскаватор', inventoryNumber: 'ЭК-001', status: 'in-use', location: 'Объект №12, ул. Ленина', acquisitionDate: '2021-03-15' },
  { id: 2, name: 'Автокран Liebherr 250т', type: 'Автокран', inventoryNumber: 'АК-002', status: 'in-use', location: 'Объект №8, пр. Мира', acquisitionDate: '2020-07-22' },
  { id: 3, name: 'Бетономешалка BMW-180', type: 'Бетономешалка', inventoryNumber: 'БМ-003', status: 'warehouse', location: 'Склад №3', acquisitionDate: '2022-01-10' },
  { id: 4, name: 'Генератор Wacker Neisen 10кВт', type: 'Генератор', inventoryNumber: 'ГН-004', status: 'repair', location: 'Ремонтная мастерская', acquisitionDate: '2019-11-05' },
  { id: 5, name: 'Компрессор Atlas Copco', type: 'Компрессор', inventoryNumber: 'КМ-005', status: 'in-use', location: 'Объект №15, ул. Строителей', acquisitionDate: '2021-09-20' },
  { id: 6, name: 'Сварочный аппарат Lincoln Electric', type: 'Сварочный аппарат', inventoryNumber: 'СА-006', status: 'in-use', location: 'Объект №12, ул. Ленина', acquisitionDate: '2023-02-28' },
  { id: 7, name: 'Бурильная установка Soilmec', type: 'Бурильная установка', inventoryNumber: 'БУ-007', status: 'warehouse', location: 'Склад №1', acquisitionDate: '2022-06-15' },
  { id: 8, name: 'Виброплита Hamm 300', type: 'Виброплита', inventoryNumber: 'ВП-008', status: 'in-use', location: 'Объект №3, ул. Полевая', acquisitionDate: '2020-04-10' },
];

const typeColors: Record<string, string> = {
  'Экскаватор': 'bg-red-100 text-red-800',
  'Автокран': 'bg-blue-100 text-blue-800',
  'Бетономешалка': 'bg-yellow-100 text-yellow-800',
  'Генератор': 'bg-orange-100 text-orange-800',
  'Компрессор': 'bg-cyan-100 text-cyan-800',
  'Сварочный аппарат': 'bg-purple-100 text-purple-800',
  'Бурильная установка': 'bg-green-100 text-green-800',
  'Виброплита': 'bg-pink-100 text-pink-800',
};

const statusColors: Record<string, string> = {
  'in-use': 'bg-green-100 text-green-800',
  'warehouse': 'bg-blue-100 text-blue-800',
  'repair': 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  'in-use': 'В работе',
  'warehouse': 'На складе',
  'repair': 'В ремонте',
};

export default function TechEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setEquipment(prev => prev.filter(item => item.id !== id));
  };

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({ status: 'warehouse' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingEquipment) {
      setEquipment(prev => prev.map(item =>
        item.id === editingEquipment.id ? { ...item, ...formData } as Equipment : item
      ));
    } else {
      const newId = Math.max(...equipment.map(e => e.id), 0) + 1;
      const newItem = { id: newId, ...formData } as Equipment;
      setEquipment(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setEditingEquipment(null);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Техника и оборудование</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить технику
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Поиск по названию, инвентарному номеру или адресу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Наименование</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Тип</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Инв. номер</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Статус</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Местонахождение</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Дата постановки на учёт</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium">{item.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${typeColors[item.type] || 'bg-gray-100 text-gray-800'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600 font-mono">{item.inventoryNumber}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{item.location}</td>
                  <td className="py-4 px-6 text-gray-600">{new Date(item.acquisitionDate).toLocaleDateString('ru-RU')}</td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEquipment(null); setFormData({}); }}
        title={editingEquipment ? 'Редактировать технику' : 'Новая техника/оборудование'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Наименование</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Экскаватор CAT 320"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
            <input
              type="text"
              value={formData.type || ''}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Экскаватор"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Инвентарный номер</label>
              <input
                type="text"
                value={formData.inventoryNumber || ''}
                onChange={e => setFormData(prev => ({ ...prev, inventoryNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="Например: ЭК-009"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата постановки на учёт</label>
              <input
                type="date"
                value={formData.acquisitionDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Местонахождение</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Объект №1, ул. Ленина"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={formData.status || 'warehouse'}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'in-use' | 'warehouse' | 'repair' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="in-use">В работе</option>
              <option value="warehouse">На складе</option>
              <option value="repair">В ремонте</option>
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setEditingEquipment(null); setFormData({}); }}
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
