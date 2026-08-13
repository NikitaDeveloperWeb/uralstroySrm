'use client';

import { useState } from 'react';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';

interface Subcontractor {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  specialization: string;
  status: 'active' | 'inactive';
}

const initialSubcontractors: Subcontractor[] = [
  { id: 1, companyName: 'ООО "СтройМонтаж"', contactPerson: 'Смирнов Алексей Петрович', phone: '+7 (900) 111-22-33', email: 'info@stroymontazh.ru', address: 'г. Екатеринбург, ул. Монтажников, д. 15', specialization: 'Монтажные работы', status: 'active' },
  { id: 2, companyName: 'ИП Козлов Д.Н.', contactPerson: 'Козлов Дмитрий Николаевич', phone: '+7 (900) 222-33-44', email: 'kozlov.dn@mail.ru', address: 'г. Челябинск, ул. Строителей, д. 8', specialization: 'Пусконаладочные работы', status: 'active' },
  { id: 3, companyName: 'ООО "Энергосервис"', contactPerson: 'Белова Ольга Сергеевна', phone: '+7 (900) 333-44-55', email: 'office@energ_service.ru', address: 'г. Тюмень, ул. Энергетическая, д. 22', specialization: 'Электромонтажные работы', status: 'active' },
  { id: 4, companyName: 'ООО "ПipeLine"', contactPerson: 'Кузнецов Игорь Витальевич', phone: '+7 (900) 444-55-66', email: 'info@pipeline.ru', address: 'г. Екатеринбург, ул. Промышленная, д. 30', specialization: 'Трубопроводные работы', status: 'inactive' },
  { id: 5, companyName: 'ИП Морозова А.В.', contactPerson: 'Морозова Анна Владимировна', phone: '+7 (900) 555-66-77', email: 'morozova.av@gmail.com', address: 'г. Нижний Тагил, ул. Ленина, д. 5', specialization: 'Сварочные работы', status: 'active' },
  { id: 6, companyName: 'ООО "ЗапоумСтрой"', contactPerson: 'Попов Андрей Леонидович', phone: '+7 (900) 666-77-88', email: 'info@zapomstroy.ru', address: 'г. Пермь, ул. Строительная, д. 12', specialization: 'Генеральный подряд', status: 'active' },
];

const specializationColors: Record<string, string> = {
  'Монтажные работы': 'bg-blue-100 text-blue-800',
  'Пусконаладочные работы': 'bg-purple-100 text-purple-800',
  'Электромонтажные работы': 'bg-yellow-100 text-yellow-800',
  'Трубопроводные работы': 'bg-cyan-100 text-cyan-800',
  'Сварочные работы': 'bg-orange-100 text-orange-800',
  'Генеральный подряд': 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
};

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(initialSubcontractors);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const [formData, setFormData] = useState<Partial<Subcontractor>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSubcontractors = subcontractors.filter(sub =>
    sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setSubcontractors(prev => prev.filter(sub => sub.id !== id));
  };

  const handleAdd = () => {
    setEditingSubcontractor(null);
    setFormData({ status: 'active' });
    setIsModalOpen(true);
  };

  const handleEdit = (sub: Subcontractor) => {
    setEditingSubcontractor(sub);
    setFormData({ ...sub });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingSubcontractor) {
      setSubcontractors(prev => prev.map(sub =>
        sub.id === editingSubcontractor.id ? { ...sub, ...formData } as Subcontractor : sub
      ));
    } else {
      const newId = Math.max(...subcontractors.map(s => s.id), 0) + 1;
      const newSubcontractor = { id: newId, ...formData } as Subcontractor;
      setSubcontractors(prev => [...prev, newSubcontractor]);
    }
    setIsModalOpen(false);
    setEditingSubcontractor(null);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Подрядчики</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить подрядчика
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Поиск по названию или контакту..."
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Название компании</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Контактное лицо</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Телефон</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Адрес</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Специализация</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Статус</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcontractors.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium">{sub.companyName}</td>
                  <td className="py-4 px-6 text-gray-600">{sub.contactPerson}</td>
                  <td className="py-4 px-6 text-gray-600">{sub.phone}</td>
                  <td className="py-4 px-6 text-gray-600">{sub.email}</td>
                  <td className="py-4 px-6 text-gray-600">{sub.address}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${specializationColors[sub.specialization] || 'bg-gray-100 text-gray-800'}`}>
                      {sub.specialization}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[sub.status]}`}>
                      {statusLabels[sub.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
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
        onClose={() => { setIsModalOpen(false); setEditingSubcontractor(null); setFormData({}); }}
        title={editingSubcontractor ? 'Редактировать подрядчика' : 'Новый подрядчик'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название компании</label>
            <input
              type="text"
              value={formData.companyName || ''}
              onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Контактное лицо</label>
            <input
              type="text"
              value={formData.contactPerson || ''}
              onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
            <input
              type="text"
              value={formData.specialization || ''}
              onChange={e => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Монтажные работы"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={formData.status || 'active'}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
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
              onClick={() => { setIsModalOpen(false); setEditingSubcontractor(null); setFormData({}); }}
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
