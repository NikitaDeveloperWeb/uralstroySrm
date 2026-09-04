'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Search, Plus, FileText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';
import * as XLSX from 'xlsx';

interface Equipment {
  id: number;
  name: string;
  type: string;
  inventoryNumber: string;
  status: string;
  location: string;
  acquisitionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({ status: 'warehouse' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { confirm } = useAlert();

  const eqNameRef = useRef<HTMLInputElement>(null);
  const eqTypeRef = useRef<HTMLInputElement>(null);
  const eqInventoryRef = useRef<HTMLInputElement>(null);
  const eqLocationRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/tech-equipment')
      .then(res => res.json())
      .then(data => setEquipment(data?.data || []))
      .catch(err => console.error('Failed to fetch equipment:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      if (eqNameRef.current) eqNameRef.current.value = '';
      if (eqTypeRef.current) eqTypeRef.current.value = '';
      if (eqInventoryRef.current) eqInventoryRef.current.value = '';
      if (eqLocationRef.current) eqLocationRef.current.value = '';
    }
  }, [isModalOpen]);

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.inventoryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить технику?'))) return;
    try {
      await fetch(`/api/tech-equipment/${id}`, { method: 'DELETE' });
      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
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
    setTimeout(() => {
      if (eqNameRef.current) eqNameRef.current.value = item.name;
      if (eqTypeRef.current) eqTypeRef.current.value = item.type;
      if (eqInventoryRef.current) eqInventoryRef.current.value = item.inventoryNumber;
      if (eqLocationRef.current) eqLocationRef.current.value = item.location;
    }, 0);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      ['Техника и оборудование'],
      ['#', 'Наименование', 'Тип', 'Инв. номер', 'Статус', 'Местонахождение', 'Дата постановки на учёт'],
    ];
    filteredEquipment.forEach((item, i) => {
      rows.push([
        String(i + 1),
        item.name,
        item.type,
        item.inventoryNumber,
        statusLabels[item.status] || item.status,
        item.location,
        item.acquisitionDate ? new Date(item.acquisitionDate).toLocaleDateString('ru-RU') : '—',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 }];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const borderStyle = { style: 'thin', color: { rgb: '000000' } };
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        if (!ws[addr].s) ws[addr].s = {};
        ws[addr].s.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
        if (R === 1) ws[addr].s.font = { bold: true };
        if (R === 0) ws[addr].s.font = { bold: true, sz: 14 };
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Техника');
    XLSX.writeFile(wb, 'техника_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handleSave = async () => {
    try {
      const body = {
        name: eqNameRef.current?.value || '',
        type: eqTypeRef.current?.value || '',
        inventoryNumber: eqInventoryRef.current?.value || '',
        location: eqLocationRef.current?.value || '',
        acquisitionDate: formData.acquisitionDate || null,
        status: formData.status || 'warehouse',
      };

      const url = editingEquipment
        ? `/api/tech-equipment/${editingEquipment?.id}`
        : '/api/tech-equipment';
      const method = editingEquipment ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data?.success) {
        if (editingEquipment) {
          setEquipment(prev => prev.map(item =>
            item.id === editingEquipment.id ? data.data : item
          ));
        } else {
          setEquipment(prev => [...prev, data.data]);
        }
        setIsModalOpen(false);
        setEditingEquipment(null);
        setFormData({ status: 'warehouse' });
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Техника и оборудование</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            Экспорт в Excel
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить технику
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по названию, инвентарному номеру или местонахождению..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
        ) : filteredEquipment.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Нет данных</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-750">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Наименование</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Тип</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Инв. номер</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Статус</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Местонахождение</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Дата постановки на учёт</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEquipment.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                    <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white dark:text-white font-medium">{item.name}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">{item.type}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400 font-mono">{item.inventoryNumber}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">{item.location}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">
                      {item.acquisitionDate
                        ? new Date(item.acquisitionDate).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
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
        )}
      </div>
      {filteredEquipment.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEquipment.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEquipment(null); setFormData({}); }}
        title={editingEquipment ? 'Редактировать технику' : 'Новая техника/оборудование'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Наименование</label>
            <input ref={eqNameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Экскаватор CAT 320" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Тип</label>
            <input ref={eqTypeRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Экскаватор" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Инвентарный номер</label>
              <input ref={eqInventoryRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: ЭК-009" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Дата постановки на учёт</label>
              <input
                type="date"
                value={formData.acquisitionDate || ''}
                onChange={e => setFormData(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Местонахождение</label>
            <input ref={eqLocationRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Объект №1, ул. Ленина" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Статус</label>
            <select
              value={formData.status || 'warehouse'}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
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
