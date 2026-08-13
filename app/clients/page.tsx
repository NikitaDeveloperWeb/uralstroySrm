'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Plus, Eye } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { useClientStore } from '@/shared/stores/clientStore';
import type { Client, ClientProject } from '@/shared/types/client';

const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};

const statusColors: Record<string, string> = {
  создан: 'bg-gray-500',
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
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingObjects, setViewingObjects] = useState<ClientProject[] | null>(null);
  const [viewingClientName, setViewingClientName] = useState('');

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

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = storeClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить клиента?')) return;
    try {
      await deleteClient(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления клиента');
    }
  };

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({ projects: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ ...client, email: client.email || undefined });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const clientData: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone,
      };
      if (formData.email) clientData.email = formData.email;

      if (editingClient) {
        await updateClient(editingClient.id, clientData);
      } else {
        await createClient(clientData);
      }
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({});
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения клиента');
    }
  };

  const handleViewObjects = (client: Client) => {
    setViewingClientName(client.name);
    setViewingObjects(client.projects);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Клиенты</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить клиента
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Поиск по имени, телефону или email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchClients(e.target.value);
          }}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleViewObjects(client)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Посмотреть объекты"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                  title="Редактировать"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4">{client.email || '—'}</div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Объектов: {client.projects.length}</span>
                  {client.projects.length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {statusLabels[client.projects[client.projects.length - 1].status] || client.projects[client.projects.length - 1].status || ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Клиенты не найдены</p>
        </div>
      )}

      {/* Модалка добавления/редактирования клиента */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClient(null); setFormData({}); }}
        title={editingClient ? 'Редактировать клиента' : 'Новый клиент'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value || undefined }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
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
              onClick={() => { setIsModalOpen(false); setEditingClient(null); setFormData({}); }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Модалка просмотра объектов клиента */}
      <Modal
        isOpen={viewingObjects !== null}
        onClose={() => { setViewingObjects(null); setViewingClientName(''); }}
        title={`Объекты клиента: ${viewingClientName}`}
      >
        <div className="space-y-4">
          {viewingObjects && viewingObjects.length > 0 ? (
            viewingObjects.map((obj) => (
              <div key={obj.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{typeIcons[obj.type] || '🏗'}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{obj.name}</h4>
                    <p className="text-sm text-gray-500">{obj.address}</p>
                  </div>
                  <div className={`ml-auto w-3 h-3 rounded-full ${statusColors[obj.status] || 'bg-gray-500'}`} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Тип:</span>{' '}
                    <span className="text-gray-700 capitalize">{obj.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Площадь:</span>{' '}
                    <span className="text-gray-700">{obj.area} м²</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Стоимость:</span>{' '}
                    <span className="text-gray-700">{typeof obj.cost === 'number' ? obj.cost.toLocaleString() : parseInt(obj.cost).toLocaleString()} ₽</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Дата сдачи:</span>{' '}
                    <span className="text-gray-700">{obj.deadline ? new Date(obj.deadline).toLocaleDateString('ru-RU') : '—'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Статус:</span>{' '}
                    <span className="text-gray-700">{statusLabels[obj.status] || obj.status || '—'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">У этого клиента пока нет объектов</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
