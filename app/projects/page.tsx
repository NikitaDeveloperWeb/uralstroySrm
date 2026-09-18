'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';
import { AddObjectForm } from '@/shared/components/dashboard/AddObjectForm';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2, Search } from 'lucide-react';
import { Pagination } from '@/shared/components/ui/Pagination';
const statusColors: Record<string, string> = {
  создан: 'bg-gray-400',
  active: 'bg-green-500',
  'в работе': 'bg-green-500',
  'на паузе': 'bg-yellow-500',
  завершен: 'bg-blue-500',
};

const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};
import { ProjectsCalendar } from '@/shared/components/projects/ProjectsCalendar';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { useProjectStore } from '@/shared/stores/projectStore';
import { ProjectEditForm } from '@/shared/components/projects/ProjectEditForm';
import { useAlert } from '@/shared/hooks/useAlert';
import type { Project, Brigade } from '@/shared/types/project';

export default function ProjectsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('все');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [brigadesLoading, setBrigadesLoading] = useState(true);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const { confirm, alert } = useAlert();

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
    fetchClients();
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

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const json = await res.json();
      if (res.ok) setClients(json.data || []);
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    }
  };

  const filteredProjects = projects.filter(p =>
    (p.code.includes(searchQuery) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedType === 'все' || p.type === selectedType)
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

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
    if (await confirm('Удалить этот объект?')) {
      await deleteProject(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    const project = projects.find(p => p.id === id);
    if (project) {
      setEditingProject(project);
      setEditForm({ ...project });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (data: Partial<Project>) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
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
    clientId?: string;
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
      code: (() => {
        const existingCodes = projects.map(p => parseInt(p.code) || 0);
        const nextCode = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
        return String(nextCode).padStart(3, '0');
      })(),
      prepayment: formData.prepayment ? parseInt(formData.prepayment) : null,
      prepaymentDate: formData.prepaymentDate || null,
      brigadeId: formData.brigadeId ? parseInt(formData.brigadeId) : null,
      clientId: formData.clientId ? parseInt(formData.clientId) : null,
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
    try {
      await createProject(projectData);
      setShowModal(false);
    } catch (e: any) {
      if (e.message.includes('уже существует')) {
        alert('Проект с таким кодом уже существует. Попробуйте другое название.', { title: 'Ошибка' });
      } else {
        alert(e.message || 'Не удалось создать проект', { title: 'Ошибка' });
      }
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Объекты</h1>
          <Button onClick={() => setShowModal(true)} className="bg-[#1976d2] hover:bg-[#1565c0] text-lg font-semibold text-white h-14 px-6 rounded-lg shadow-md">
            <span className="mr-2">+</span>
            Добавить объект
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Поиск по коду, названию или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white dark:bg-slate-700 dark:text-white"
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
                  : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#1976d2] text-white'
                : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#1976d2] text-white'
                : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'grid' && filteredProjects.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProjects.map((obj) => (
                <div
                  key={obj.id}
                  className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 overflow-hidden"
                >
                  <div
                    onClick={() => router.push(`/projects/${obj.id}`)}
                    className="p-5 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">{typeIcons[obj.type] || '🏗'}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">{obj.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">{obj.address}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${statusColors[obj.status]}`} />
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">Площадь: {obj.area} м²</span>
                      <span className="text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">{obj.cost.toLocaleString()} ₽</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Тип: {obj.type}</span>
                      <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Сложность: {obj.complexity}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[obj.status]}`} />
                        <span className="text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">{obj.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 pb-5 flex gap-2">
                    <button
                      onClick={(e) => handleEdit(e, obj.id)}
                      className="flex-1 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, obj.id)}
                      className="flex-1 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProjects.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
        {viewMode === 'calendar' && (
          <ProjectsCalendar />
        )}
        {viewMode === 'grid' && filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-lg">Объекты не найдены</p>
          </div>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Добавить объект">
        <AddObjectForm onSubmit={handleAddObject} brigades={brigades} clients={clients} />
      </Modal>
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditForm({}); }} title="Редактировать объект">
        <ProjectEditForm
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditForm({}); }}
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveEdit}
          brigades={brigades}
          clients={clients}
        />
      </Modal>
    </>
  );
}
