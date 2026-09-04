'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pencil, Trash2, Search, Plus, Eye, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import Link from 'next/link';
import { useClientStore } from '@/shared/stores/clientStore';
import type { Client, ClientProject } from '@/shared/types/client';
import { ClientForm } from '@/shared/components/clients/ClientForm';
import { useAlert } from '@/shared/hooks/useAlert';

const typeLabels: Record<string, string> = {
  дом: 'Дом',
  баня: 'Баня',
  туалет: 'Туалет',
  хозблок: 'Хозблок',
  веранда: 'Веранда',
  другое: 'Другое',
};

const statusColors: Record<string, string> = {
  создан: 'bg-gray-400 dark:bg-slate-600 dark:bg-slate-600',
  'в работе': 'bg-blue-500',
  завершен: 'bg-green-500',
};

const statusLabels: Record<string, string> = {
  создан: 'Создан',
  'в работе': 'В работе',
  завершен: 'Завершен',
};

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingObjects, setViewingObjects] = useState<ClientProject[] | null>(null);
  const [viewingClientName, setViewingClientName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const CLIENTS_PER_PAGE = 9;
  const { alert, confirm } = useAlert();

  useEffect(() => {
    fetchClients();
  }, []);

  // Zustand store
  const {
    clients: storeClients,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  } = useClientStore();

  const filteredClients = storeClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE) || 1;
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * CLIENTS_PER_PAGE,
    currentPage * CLIENTS_PER_PAGE,
  );

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить клиента?'))) return;
    try {
      await deleteClient(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления клиента');
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (data: { name: string; phone: string; email: string | null }) => {
    try {
      const clientData: Record<string, unknown> = {
        name: data.name,
        phone: data.phone,
      };
      if (data.email) clientData.email = data.email;

      if (editingClient) {
        await updateClient(editingClient.id, clientData);
      } else {
        await createClient(clientData);
      }
      setEditingClient(null);
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения клиента');
    }
  };

  const handleViewObjects = (client: Client) => {
    setViewingClientName(client.name);
    setViewingObjects(client.projects);
  };

  const totalClients = storeClients.length;
  const totalProjects = storeClients.reduce((sum, c) => sum + c.projects.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Клиенты</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить клиента
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-[#1976d2] dark:text-blue-400">{totalClients}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Клиентов</div>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalProjects}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Объектов</div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по имени, телефону или email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchClients(e.target.value);
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white dark:bg-slate-700 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-lg">Загрузка...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedClients.map((client) => (
            <div key={client.id} className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleViewObjects(client)}
                  className="p-2 text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Посмотреть объекты"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-[#1976d2] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">{client.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">{client.phone}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {client.phone}
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 dark:text-slate-300">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Объектов: {client.projects.length}</span>
                  {client.projects.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${statusColors[client.projects[client.projects.length - 1]?.status] || 'bg-gray-400 dark:bg-slate-600 dark:bg-slate-600'}`}>
                      {statusLabels[client.projects[client.projects.length - 1]?.status] || '—'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredClients.length}
          itemsPerPage={CLIENTS_PER_PAGE}
        />
        </div>
      )}

      {!loading && !error && filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-lg">Клиенты не найдены</p>
        </div>
      )}

      {/* Модалка добавления/редактирования клиента */}
      <ClientForm
        isOpen={isModalOpen}
        editingClient={editingClient}
        onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
        onSave={handleSaveClient}
      />

      {/* Модалка просмотра объектов клиента */}
      <Modal
        isOpen={viewingObjects !== null}
        onClose={() => { setViewingObjects(null); setViewingClientName(''); }}
        title={`Объекты клиента: ${viewingClientName}`}
      >
        <div className="space-y-4">
          {viewingObjects && viewingObjects.length > 0 ? (
            viewingObjects.map((obj) => (
              <div key={obj.id} className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{'🏠'}</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">{obj.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">{obj.address}</p>
                  </div>
                  <div className={`ml-auto w-3 h-3 rounded-full ${statusColors[obj.status] || 'bg-gray-50 dark:bg-slate-700 dark:bg-slate-7000'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Тип:</span>{' '}
                    <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">{typeLabels[obj.type] || obj.type || 'Другое'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Площадь:</span>{' '}
                    <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">{obj.area} м²</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Стоимость:</span>{' '}
                    <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">{typeof obj.cost === 'number' ? obj.cost.toLocaleString() : parseInt(obj.cost).toLocaleString()} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Дата сдачи:</span>{' '}
                    <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">{obj.deadline ? new Date(obj.deadline).toLocaleDateString('ru-RU') : '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Статус:</span>{' '}
                    <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">{statusLabels[obj.status] || obj.status || '—'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 py-8">У этого клиента пока нет объектов</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
