'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';
import { AddObjectForm } from '@/shared/components/dashboard/AddObjectForm';
import Link from 'next/link';
import { Edit2, Trash2, Search } from 'lucide-react';
import { statusColors, typeIcons } from '@/shared/data/projects';
import { ProjectsCalendar } from '@/shared/components/projects/ProjectsCalendar';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { useProjectStore } from '@/shared/stores/projectStore';
import type { Project, Brigade } from '@/shared/types/project';

export default function ProjectsPage() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('все');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [brigadesLoading, setBrigadesLoading] = useState(true);

  const projects = useProjectStore(state => state.projects);
  const fetchProjects = useProjectStore(state => state.fetchProjects);
  const createProject = useProjectStore(state => state.createProject);
  const updateProject = useProjectStore(state => state.updateProject);
  const deleteProject = useProjectStore(state => state.deleteProject);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchBrigades();
  }, []);

  const fetchBrigades = async () => {
    try {
      const res = await fetch('/api/brigades');
      const json = await res.json();
      if (res.ok) setBrigades(json.data || []);
    } catch (error) {
      console.error('Ошибка загрузки бригад:', error);
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.code.includes(searchQuery) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedType === 'все' || p.type === selectedType)
  );

  const types = [
    { value: 'все', label: 'Все' },
    { value: 'дом', label: 'Дом' },
    { value: 'баня', label: 'Баня' },
    { value: 'туалет', label: 'Туалет' },
    { value: 'хозблок', label: 'Хозблок' },
    { value: 'веранда', label: 'Веранда' },
  ];

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Удалить этот объект?')) {
      await deleteProject(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setEditForm({ ...project });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (editingProject) {
      await updateProject(editingProject.id, editForm);
      setShowEditModal(false);
      setEditingProject(null);
      setEditForm({});
    }
  };

  const handleAddObject = async (formData: {
    name: string;
    area: string;
    address: string;
    type: string;
    cost: string;
    date: string;
    complexity: string;
    prepayment?: string;
    prepaymentDate?: string;
    brigadeId?: string;
    floors?: string;
    roofType?: string;
    roofColor?: string;
    hasMansard?: boolean;
    hasVeranda?: boolean;
    verandaSize?: string;
    hasPorhch?: boolean;
    foundations?: string;
    walls?: string;
    insulation?: string;
    windows?: string;
    doorType?: string;
    roofMaterial?: string;
    communication?: string;
    description?: string;
    layout?: string;
    insulationThickness?: string;
    baseType?: string;
    homeType?: string;
  }) => {
    const projectData = {
      name: formData.name,
      area: formData.area,
      address: formData.address,
      type: formData.type,
      cost: parseInt(formData.cost) || 0,
      deadline: formData.date,
      complexity: formData.complexity,
      status: 'создан',
      code: new Date().getDate().toString().padStart(2, '0') +
            (new Date().getMonth() + 1).toString().padStart(2, '0') +
            new Date().getFullYear().toString() +
            Math.floor(Math.random() * 100).toString().padStart(2, '0'),
      prepayment: formData.prepayment ? parseInt(formData.prepayment) : null,
      prepaymentDate: formData.prepaymentDate || null,
      brigadeId: formData.brigadeId ? parseInt(formData.brigadeId) : null,
      // Поля для карты объекта
      floors: formData.floors ? parseInt(formData.floors) : null,
      roofType: formData.roofType || null,
      roofColor: formData.roofColor || null,
      hasMansard: formData.hasMansard || null,
      hasVeranda: formData.hasVeranda || null,
      verandaSize: formData.verandaSize || null,
      hasPorhch: formData.hasPorhch || null,
      foundations: formData.foundations || null,
      walls: formData.walls || null,
      insulation: formData.insulation || null,
      windows: formData.windows || null,
      doorType: formData.doorType || null,
      roofMaterial: formData.roofMaterial || null,
      communication: formData.communication || null,
      description: formData.description || null,
      layout: formData.layout || null,
      insulationThickness: formData.insulationThickness || null,
      baseType: formData.baseType || null,
      homeType: formData.homeType || null,
    };
    await createProject(projectData);
    setShowModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Объекты</h1>
          <Button onClick={() => setShowModal(true)} className="bg-[#1976d2] hover:bg-[#1565c0] text-lg font-semibold text-white h-14 px-6 rounded-lg shadow-md">
            <span className="mr-2">+</span>
            Добавить объект
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по коду, названию или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedType === t.value
                  ? 'bg-[#1976d2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#1976d2] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            Сетка
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#1976d2] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Календарь
          </button>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((obj, index) => (
              <div key={obj.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEdit(e, obj.id)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, obj.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Link href={`/projects/${obj.id}`} className="block">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{typeIcons[obj.type] || '🏗'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{obj.name}</h3>
                    <p className="text-sm text-gray-500">{obj.address}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${statusColors[obj.status]}`} />
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Площадь: {obj.area} м²</span>
                  <span className="text-gray-600">{obj.cost.toLocaleString()} ₽</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">Тип: {obj.type}</span>
                  <span className="text-gray-500">Сложность: {obj.complexity}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[obj.status]}`} />
                    <span className="text-gray-600">{obj.status}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        ) : (
          <ProjectsCalendar />
        )}
        {viewMode === 'grid' && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Объекты не найдены</p>
          </div>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Добавить объект">
        <AddObjectForm onSubmit={handleAddObject} brigades={brigades} />
      </Modal>
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditForm({}); }} title="Редактировать объект">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
              <input
                type="text"
                value={editForm.type || ''}
                onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Площадь (м²)</label>
              <input
                type="text"
                value={editForm.area || ''}
                onChange={e => setEditForm(prev => ({ ...prev, area: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input
              type="text"
              value={editForm.address || ''}
              onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
              <input
                type="number"
                value={editForm.cost ?? ''}
                onChange={e => setEditForm(prev => ({ ...prev, cost: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата сдачи</label>
              <input
                type="date"
                value={editForm.deadline || ''}
                onChange={e => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сложность</label>
              <select
                value={editForm.complexity || 'средний'}
                onChange={e => setEditForm(prev => ({ ...prev, complexity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="легкий">Легкий</option>
                <option value="средний">Средний</option>
                <option value="сложный">Сложный</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={editForm.status || 'создан'}
                onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="создан">Создан</option>
                <option value="в работе">В работе</option>
                <option value="завершен">Завершен</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код объекта</label>
            <input
              type="text"
              value={editForm.code || ''}
              onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Бригада</label>
            <select
              value={editForm.brigadeId ?? ''}
              onChange={e => setEditForm(prev => ({ ...prev, brigadeId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            >
              <option value="">Без бригады</option>
              {(brigades || []).map(brigade => (
                <option key={brigade.id} value={brigade.id}>{brigade.name}</option>
              ))}
            </select>
          </div>

          {/* Секция карты объекта */}
          <div className="pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏗 Карта объекта</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество этажей</label>
                <input
                  type="number"
                  value={editForm.floors ?? ''}
                  onChange={e => setEditForm(prev => ({ ...prev, floors: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип крыши</label>
                <select
                  value={editForm.roofType || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, roofType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="">Не выбрано</option>
                  <option value="односкатная">Односкатная</option>
                  <option value="двускатная">Двускатная</option>
                  <option value="вальмовая">Вальмовая</option>
                  <option value="шатровая">Шатровая</option>
                  <option value="другое">Другое</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цвет крыши</label>
                <input
                  type="text"
                  value={editForm.roofColor || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, roofColor: e.target.value }))}
                  placeholder="Красный, коричневый..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип фундамента</label>
                <select
                  value={editForm.foundations || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, foundations: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="">Не выбрано</option>
                  <option value="ленточный">Ленточный</option>
                  <option value="свайный">Свайный</option>
                  <option value="плитный">Плитный</option>
                  <option value="столбчатый">Столбчатый</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип стен</label>
                <select
                  value={editForm.walls || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, walls: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="">Не выбрано</option>
                  <option value="кирпич">Кирпич</option>
                  <option value="газобетон">Газобетон</option>
                  <option value="дерево">Дерево</option>
                  <option value="каркас">Каркас</option>
                  <option value="SIP-панели">SIP-панели</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип утепления</label>
                <select
                  value={editForm.insulation || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, insulation: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="">Не выбрано</option>
                  <option value="минеральная вата">Минеральная вата</option>
                  <option value="пенополистирол">Пенополистирол (ПС)</option>
                  <option value="экструдированный пенополистирол">Экструдированный (ЭППС)</option>
                  <option value="пенополиуретан">Пенополиуретан (ППУ)</option>
                  <option value="эковата">Эковата</option>
                  <option value="пенофол">Пенофол</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Толщина утепления</label>
                <input
                  type="text"
                  value={editForm.insulationThickness || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, insulationThickness: e.target.value }))}
                  placeholder="50мм, 100мм, 150мм..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип окон</label>
                <select
                  value={editForm.windows || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, windows: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                >
                  <option value="">Не выбрано</option>
                  <option value="пластиковые">Пластиковые (ПВХ)</option>
                  <option value="деревянные">Деревянные</option>
                  <option value="деревянно-алюминиевые">Деревянно-алюминиевые</option>
                  <option value="другие">Другие</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип двери</label>
                <input
                  type="text"
                  value={editForm.doorType || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, doorType: e.target.value }))}
                  placeholder="Металлическая, деревянная..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasMansard || false}
                  onChange={e => setEditForm(prev => ({ ...prev, hasMansard: e.target.checked }))}
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Мансарда</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasVeranda || false}
                  onChange={e => setEditForm(prev => ({ ...prev, hasVeranda: e.target.checked }))}
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Веранда</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasPorhch || false}
                  onChange={e => setEditForm(prev => ({ ...prev, hasPorhch: e.target.checked }))}
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Крыльцо</span>
              </label>
            </div>

            {(editForm.hasVeranda || editForm.verandaSize) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Размер веранды</label>
                <input
                  type="text"
                  value={editForm.verandaSize || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, verandaSize: e.target.value }))}
                  placeholder="Например: 2x4 м"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Основание</label>
              <select
                value={editForm.baseType || ''}
                onChange={e => setEditForm(prev => ({ ...prev, baseType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="">Не выбрано</option>
                <option value="ленточный">Ленточный</option>
                <option value="свайный">Свайный</option>
                <option value="плитный">Плитный</option>
                <option value="столбчатый">Столбчатый</option>
                <option value="свайно-вин��овой">Свайно-винтовой</option>
                <option value="другое">Другое</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип дома</label>
              <select
                value={editForm.homeType || ''}
                onChange={e => setEditForm(prev => ({ ...prev, homeType: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="">Не выбрано</option>
                <option value="круглогодичный">Круглогодичный</option>
                <option value="сезонный">Сезонный</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип кровли</label>
              <select
                value={editForm.roofMaterial || ''}
                onChange={e => setEditForm(prev => ({ ...prev, roofMaterial: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="">Не выбрано</option>
                <option value="металлочерепица">Металлочерепица</option>
                <option value="soft roof">Мягкая кровля (Soft Roof)</option>
                <option value="профнастил">Профнастил</option>
                <option value="ондулин">Ондулин</option>
                <option value="еврорубероид">Еврорубероид</option>
                <option value="деревянная">Деревянная</option>
                <option value="другая">Другая</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Коммуникации</label>
              <textarea
                value={editForm.communication || ''}
                onChange={e => setEditForm(prev => ({ ...prev, communication: e.target.value }))}
                placeholder="Газ, вода, электричество, канализация..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Планировка</label>
              <textarea
                value={editForm.layout || ''}
                onChange={e => setEditForm(prev => ({ ...prev, layout: e.target.value }))}
                placeholder="1 этаж: прихожая, кухня, гостиная...\n2 этаж: спальни, ванные..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={editForm.description || ''}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Дополнительное описание объекта..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setShowEditModal(false); setEditForm({}); }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
