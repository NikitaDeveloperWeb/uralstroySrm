'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Plus, Users, X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { useEmployeeStore } from '@/shared/stores/employeeStore';

export const allSkills = [
  'сварщик', 'каменщик', 'плотник', 'монтажник', 'электрик', 'сантехник',
  'маляр', 'штукатур', 'крановщик', 'бетонщик', 'гибочик металла', 'строитель-универсал',
  'кровельщик',
] as const;

export type SkillType = typeof allSkills[number];

interface Employee {
  id: number;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  hireDate: string;
  workplace: 'цех' | 'монтаж';
  paymentType: 'сменная' | 'сдельная';
  employmentType: 'штат' | 'подработка';
  skills: SkillType[];
}

const initialEmployees: Employee[] = [
  { id: 1, fullName: 'Иванов Иван Иванович', birthDate: '1985-03-15', phone: '+7 (900) 123-45-67', address: 'г. Москва, ул. Ленина, д. 10, кв. 5', hireDate: '2020-01-10', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['сварщик', 'каменщик'] },
  { id: 2, fullName: 'Петров Петр Сергеевич', birthDate: '1990-07-22', phone: '+7 (900) 234-56-78', address: 'г. Москва, ул. Мира, д. 25, кв. 12', hireDate: '2019-05-20', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['монтажник', 'электрик', 'сварщик'] },
  { id: 3, fullName: 'Сидоров Алексей Дмитриевич', birthDate: '1988-11-05', phone: '+7 (900) 345-67-89', address: 'г. Москва, ул. Садовая, д. 8, кв. 3', hireDate: '2021-03-15', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['плотник', 'крановщик'] },
  { id: 4, fullName: 'Козлов Дмитрий Николаевич', birthDate: '1992-02-18', phone: '+7 (900) 456-78-90', address: 'г. Москва, ул. Центральная, д. 15, кв. 20', hireDate: '2022-07-01', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'подработка', skills: ['монтажник', 'маляр'] },
  { id: 5, fullName: 'Морозова Анна Владимировна', birthDate: '1995-09-30', phone: '+7 (900) 567-89-01', address: 'г. Москва, ул. Полевая, д. 3, кв. 8', hireDate: '2023-01-20', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['штукатур', 'маляр'] },
  { id: 6, fullName: 'Новиков Сергей Андреевич', birthDate: '1987-06-12', phone: '+7 (900) 678-90-12', address: 'г. Москва, ул. Заводская, д. 22, кв. 15', hireDate: '2018-11-05', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['сантехник', 'электрик', 'сварщик'] },
  { id: 7, fullName: 'Волкова Елена Игоревна', birthDate: '1993-12-25', phone: '+7 (900) 789-01-23', address: 'г. Москва, ул. Строителей, д. 5, кв. 30', hireDate: '2021-09-10', workplace: 'цех', paymentType: 'сменная', employmentType: 'подработка', skills: ['бетонщик', 'строитель-универсал'] },
  { id: 8, fullName: 'Соколов Максим Павлович', birthDate: '1991-04-08', phone: '+7 (900) 890-12-34', address: 'г. Москва, ул. Промышленная, д. 11, кв. 7', hireDate: '2020-06-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['каменщик', 'монтажник'] },
  { id: 9, fullName: 'Кузнецов Андрей Владимирович', birthDate: '1986-08-20', phone: '+7 (900) 901-23-45', address: 'г. Москва, ул. Строителей, д. 18, кв. 42', hireDate: '2017-04-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['кровельщик', 'сварщик', 'монтажник'] },
  { id: 10, fullName: 'Попова Ольга Сергеевна', birthDate: '1994-03-10', phone: '+7 (901) 112-23-34', address: 'г. Москва, ул. Строителей, д. 20, кв. 8', hireDate: '2021-06-01', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['маляр', 'штукатур'] },
  { id: 11, fullName: 'Васильев Дмитрий Николаевич', birthDate: '1989-11-25', phone: '+7 (901) 223-34-45', address: 'г. Москва, ул. Строителей, д. 22, кв. 15', hireDate: '2020-09-10', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['плотник', 'крановщик'] },
  { id: 12, fullName: 'Зайцева Мария Александровна', birthDate: '1992-06-18', phone: '+7 (901) 334-45-56', address: 'г. Москва, ул. Строителей, д. 24, кв. 22', hireDate: '2022-02-20', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['маляр', 'штукатур', 'строитель-универсал'] },
  { id: 13, fullName: 'Орлов Павел Дмитриевич', birthDate: '1984-01-05', phone: '+7 (901) 445-56-67', address: 'г. Москва, ул. Строителей, д. 26, кв. 30', hireDate: '2016-08-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['каменщик', 'бетонщик'] },
  { id: 14, fullName: 'Новикова Елена Павловна', birthDate: '1996-09-12', phone: '+7 (901) 556-67-78', address: 'г. Москва, ул. Строителей, д. 28, кв. 5', hireDate: '2023-03-01', workplace: 'цех', paymentType: 'сменная', employmentType: 'подработка', skills: ['электрик', 'сантехник'] },
  { id: 15, fullName: 'Федоров Алексей Игоревич', birthDate: '1987-12-30', phone: '+7 (901) 667-78-89', address: 'г. Москва, ул. Строителей, д. 30, кв. 12', hireDate: '2019-11-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['сварщик', 'кровельщик'] },
];

export interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
  skills: SkillType[];
}

const initialBrigades: Brigade[] = [
  { id: 1, name: 'Бригада «Строй»', leaderId: 1, memberIds: [2, 4], skills: ['сварщик', 'монтажник', 'каменщик'] },
  { id: 2, name: 'Бригада «Монтаж»', leaderId: 6, memberIds: [3, 5], skills: ['плотник', 'бетонщик', 'штукатур'] },
  { id: 3, name: 'Бригада «Универсал»', leaderId: 7, memberIds: [8, 14], skills: ['строитель-универсал', 'сантехник', 'электрик'] },
  { id: 4, name: 'Бригада «Кровля»', leaderId: 9, memberIds: [10, 11], skills: ['кровельщик', 'сварщик', 'монтажник'] },
  { id: 5, name: 'Бригада «Фасад»', leaderId: 12, memberIds: [13, 15], skills: ['маляр', 'штукатур', 'каменщик'] },
];

const workplaceColors: Record<string, string> = {
  цех: 'bg-blue-100 text-blue-800',
  монтаж: 'bg-purple-100 text-purple-800',
};

const paymentTypeColors: Record<string, string> = {
  'сменная': 'bg-green-100 text-green-800',
  'сдельная': 'bg-orange-100 text-orange-800',
};

const employmentTypeColors: Record<string, string> = {
  'штат': 'bg-indigo-100 text-indigo-800',
  'подработка': 'bg-teal-100 text-teal-800',
};

const skillColors: Record<string, string> = {
  'сварщик': 'bg-yellow-100 text-yellow-800',
  'каменщик': 'bg-amber-100 text-amber-800',
  'плотник': 'bg-orange-100 text-orange-800',
  'монтажник': 'bg-purple-100 text-purple-800',
  'электрик': 'bg-cyan-100 text-cyan-800',
  'сантехник': 'bg-blue-100 text-blue-800',
  'маляр': 'bg-pink-100 text-pink-800',
  'штукатур': 'bg-lime-100 text-lime-800',
  'крановщик': 'bg-red-100 text-red-800',
  'бетонщик': 'bg-gray-100 text-gray-800',
  'гибочик металла': 'bg-indigo-100 text-indigo-800',
  'строитель-универсал': 'bg-teal-100 text-teal-800',
};

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'brigades'>('employees');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Brigades state
  const [isBrigadeModalOpen, setIsBrigadeModalOpen] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState<Brigade | null>(null);
  const [brigadeFormData, setBrigadeFormData] = useState<Partial<Brigade>>({});
  const [brigadeSearch, setBrigadeSearch] = useState('');

  // Zustand store
  const {
    employees: storeEmployees,
    brigades: storeBrigades,
    loading,
    error,
    fetchEmployees,
    fetchBrigades,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createBrigade,
    updateBrigade,
    deleteBrigade,
  } = useEmployeeStore();

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchEmployees();
    fetchBrigades();
  }, [fetchEmployees, fetchBrigades]);

  // Преобразование данных из API (строки в массивы)
  const employees = storeEmployees.map(emp => ({
    ...emp,
    fullName: emp.fullName,
    birthDate: emp.birthDate,
    phone: emp.phone,
    address: emp.address,
    hireDate: emp.hireDate,
    workplace: emp.workplace as 'цех' | 'монтаж',
    paymentType: emp.paymentType as 'сменная' | 'сдельная',
    employmentType: emp.employmentType as 'штат' | 'подработка',
    skills: emp.skills ? emp.skills.split(',').filter(Boolean) as SkillType[] : [],
    brigadeId: emp.brigadeId,
  })) as Employee[];

  const brigades = storeBrigades.map(b => ({
    ...b,
    skills: b.skills ? b.skills.split(',').filter(Boolean) as SkillType[] : [],
    memberIds: b.memberIds ? b.memberIds.split(',').filter(Boolean).map(Number) : [],
  }));

  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBrigades = brigades.filter(b =>
    b.name.toLowerCase().includes(brigadeSearch.toLowerCase()) ||
    b.skills.some(s => s.toLowerCase().includes(brigadeSearch.toLowerCase()))
  );

  const getEmployeeById = (id: number) => employees.find(e => e.id === id);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сотрудника?')) return;
    try {
      await deleteEmployee(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления сотрудника');
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({ workplace: 'цех', paymentType: 'сменная', employmentType: 'штат' });
    setIsModalOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      workplace: emp.workplace as 'цех' | 'монтаж',
      paymentType: emp.paymentType as 'сменная' | 'сдельная',
      employmentType: emp.employmentType as 'штат' | 'подработка',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const employeeData = {
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        phone: formData.phone,
        address: formData.address,
        hireDate: formData.hireDate,
        workplace: formData.workplace,
        paymentType: formData.paymentType,
        employmentType: formData.employmentType,
        skills: (formData.skills || []).join(','),
      };

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        await createEmployee(employeeData);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({});
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения сотрудника');
    }
  };

  // Brigades handlers
  const openBrigadeModal = (brigade?: Brigade) => {
    if (brigade) {
      setEditingBrigade(brigade);
      setBrigadeFormData({ ...brigade });
    } else {
      setEditingBrigade(null);
      setBrigadeFormData({ skills: [] });
    }
    setIsBrigadeModalOpen(true);
  };

  const handleSaveBrigade = async () => {
    if (!brigadeFormData.name || !brigadeFormData.leaderId) return;

    try {
      const brigadeData = {
        name: brigadeFormData.name,
        leaderId: brigadeFormData.leaderId,
        memberIds: (brigadeFormData.memberIds || []).join(','),
        skills: (brigadeFormData.skills || []).join(','),
      };

      if (editingBrigade) {
        await updateBrigade(editingBrigade.id, brigadeData);
      } else {
        await createBrigade(brigadeData);
      }
      setIsBrigadeModalOpen(false);
      setEditingBrigade(null);
      setBrigadeFormData({});
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения бригады');
    }
  };

  const handleDeleteBrigade = async (id: number) => {
    if (confirm('Удалить эту бригаду?')) {
      try {
        await deleteBrigade(id);
      } catch (e: any) {
        alert(e.message || 'Ошибка удаления бригады');
      }
    }
  };

  const toggleSkill = (skill: SkillType, currentSkills: SkillType[]): SkillType[] => {
    return currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Сотрудники</h1>
        <div className="flex gap-2">
          {activeTab === 'employees' && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить сотрудника
            </button>
          )}
          {activeTab === 'brigades' && (
            <button
              onClick={() => openBrigadeModal()}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить бригаду
            </button>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'employees'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="w-4 h-4" />
          Сотрудники
        </button>
        <button
          onClick={() => setActiveTab('brigades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'brigades'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Бригады ({brigades.length})
        </button>
      </div>

      {activeTab === 'employees' && (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по имени..."
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ФИО</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Дата рождения</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Номер телефона</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Адрес проживания</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Дата принятия</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Навыки</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Место работы</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Тип оплаты</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Тип сотрудничества</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-gray-900 font-medium">{emp.fullName}</td>
                  <td className="py-4 px-6 text-gray-600">{new Date(emp.birthDate).toLocaleDateString('ru-RU')}</td>
                  <td className="py-4 px-6 text-gray-600">{emp.phone}</td>
                  <td className="py-4 px-6 text-gray-600">{emp.address}</td>
                  <td className="py-4 px-6 text-gray-600">{new Date(emp.hireDate).toLocaleDateString('ru-RU')}</td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {emp.skills.length > 0 ? emp.skills.map(skill => (
                        <span key={skill} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skillColors[skill] || 'bg-gray-100 text-gray-800'}`}>
                          {skill}
                        </span>
                      )) : <span className="text-gray-400 text-sm">—</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${workplaceColors[emp.workplace]}`}>
                      {emp.workplace}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${paymentTypeColors[emp.paymentType]}`}>
                      {emp.paymentType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${employmentTypeColors[emp.employmentType]}`}>
                      {emp.employmentType}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
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
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); setFormData({}); }}
        title={editingEmployee ? 'Редактировать сотрудника' : 'Новый сотрудник'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
              <input
                type="date"
                value={formData.birthDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата принятия</label>
              <input
                type="date"
                value={formData.hireDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес проживания</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Место работы</label>
              <select
                value={formData.workplace || 'цех'}
                onChange={e => setFormData(prev => ({ ...prev, workplace: e.target.value as 'цех' | 'монтаж' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="цех">Цех</option>
                <option value="монтаж">Монтаж</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип оплаты</label>
              <select
                value={formData.paymentType || 'сменная'}
                onChange={e => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'сменная' | 'сдельная' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="сменная">Сменная</option>
                <option value="сдельная">Сдельная</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип сотрудничества</label>
              <select
                value={formData.employmentType || 'штат'}
                onChange={e => setFormData(prev => ({ ...prev, employmentType: e.target.value as 'штат' | 'подработка' }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="штат">Штат</option>
                <option value="подработка">Подработка</option>
              </select>
            </div>
          </div>
          {/* Навыки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Навыки</label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    skills: toggleSkill(skill, (prev.skills || []) as SkillType[])
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (formData.skills || []).includes(skill)
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setEditingEmployee(null); setFormData({}); }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
      </div>
      )}

      {activeTab === 'brigades' && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск по названию или навыку бригады..."
              value={brigadeSearch}
              onChange={(e) => setBrigadeSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrigades.map((brigade) => {
              const leader = getEmployeeById(brigade.leaderId);
              const members = brigade.memberIds
                .map(id => getEmployeeById(id))
                .filter(Boolean);

              return (
                <div key={brigade.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openBrigadeModal(brigade)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrigade(brigade.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1976d2]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#1976d2]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{brigade.name}</h3>
                      {leader && <p className="text-sm text-gray-500">Прораб: {leader.fullName}</p>}
                    </div>
                  </div>

                  {/* Навыки бригады */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Навыки</p>
                    <div className="flex flex-wrap gap-1">
                      {brigade.skills.map(skill => (
                        <span key={skill} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skillColors[skill] || 'bg-gray-100 text-gray-800'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Участники */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Участники ({members.length + 1})</p>
                    <div className="space-y-2">
                      {/* Прораб */}
                      {leader && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-[#1976d2] text-white flex items-center justify-center text-xs font-bold">
                            {leader.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-gray-700 font-medium">{leader.fullName}</span>
                          <span className="text-xs text-gray-400 ml-auto">прораб</span>
                        </div>
                      )}
                      {/* Остальные участники */}
                      {members.map(member => (
                        <div key={member!.id} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                            {member!.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-gray-700">{member!.fullName}</span>
                          <span className="text-xs text-gray-400 ml-auto">{member!.workplace}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBrigades.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Бригады не найдены</p>
            </div>
          )}
        </div>
      )}

      {/* Ошибка загрузки */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {/* Модальное окно бригады */}
      <Modal
        isOpen={isBrigadeModalOpen}
        onClose={() => { setIsBrigadeModalOpen(false); setEditingBrigade(null); setBrigadeFormData({}); }}
        title={editingBrigade ? 'Редактировать бригаду' : 'Новая бригада'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={brigadeFormData.name || ''}
              onChange={e => setBrigadeFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              placeholder="Например: Бригада «Строй»"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Прораб</label>
            <select
              value={brigadeFormData.leaderId || 0}
              onChange={e => setBrigadeFormData(prev => ({ ...prev, leaderId: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value={0}>Выберите прораба</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Участники</label>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
              {employees.filter(e => e.id !== brigadeFormData.leaderId).map(emp => (
                <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(brigadeFormData.memberIds || []).includes(emp.id)}
                    onChange={e => {
                      const current = brigadeFormData.memberIds || [];
                      const updated = e.target.checked
                        ? [...current, emp.id]
                        : current.filter(id => id !== emp.id);
                      setBrigadeFormData(prev => ({ ...prev, memberIds: updated }));
                    }}
                    className="rounded border-gray-300 text-[#1976d2] focus:ring-[#1976d2]"
                  />
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {emp.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-sm text-gray-700">{emp.fullName}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${workplaceColors[emp.workplace]}`}>
                    {emp.workplace}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Навыки бригады</label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => {
                const selected = (brigadeFormData.skills || []).includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setBrigadeFormData(prev => ({
                      ...prev,
                      skills: toggleSkill(skill, (prev.skills || []) as SkillType[])
                    }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-[#1976d2] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveBrigade}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsBrigadeModalOpen(false); setEditingBrigade(null); setBrigadeFormData({}); }}
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
