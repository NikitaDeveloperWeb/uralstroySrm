'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Trash2, Search, Plus, FileText } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';
import * as XLSX from 'xlsx';

type Tab = 'subcontractors' | 'suppliers';

interface Subcontractor {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string;
  specialization: string;
  status: 'active' | 'inactive';
}

interface Supplier {
  id: number;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string;
  category: string;
  status: 'active' | 'inactive';
}

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
  inactive: 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200',
};

const statusLabels: Record<string, string> = {
  active: 'Активен',
  inactive: 'Неактивен',
};

export default function SubcontractorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('subcontractors');
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcontractor, setEditingSubcontractor] = useState<Subcontractor | null>(null);
  const [formData, setFormData] = useState<Partial<Subcontractor>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [supplierPage, setSupplierPage] = useState(1);
  const itemsPerPage = 12;
  const supplierItemsPerPage = 12;
  const { confirm } = useAlert();

  const fetchSubcontractors = async () => {
    try {
      const res = await fetch('/api/subcontractors');
      const data = await res.json();
      const list = data?.data || (Array.isArray(data) ? data : []);
      setSubcontractors(list);
    } catch (error) {
      console.error('Failed to fetch subcontractors:', error);
      setSubcontractors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontractors();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      if (subCompanyNameRef.current) subCompanyNameRef.current.value = '';
      if (subContactPersonRef.current) subContactPersonRef.current.value = '';
      if (subPhoneRef.current) subPhoneRef.current.value = '';
      if (subEmailRef.current) subEmailRef.current.value = '';
      if (subAddressRef.current) subAddressRef.current.value = '';
      if (subSpecializationRef.current) subSpecializationRef.current.value = '';
    }
  }, [isModalOpen]);

  const filteredSubcontractors = subcontractors.filter(sub =>
    sub.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubcontractors.length / itemsPerPage);
  const paginatedSubcontractors = filteredSubcontractors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить подрядчика?'))) return;
    try {
      await fetch(`/api/subcontractors/${id}`, { method: 'DELETE' });
      setSubcontractors(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
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
    setTimeout(() => {
      if (subCompanyNameRef.current) subCompanyNameRef.current.value = sub.companyName;
      if (subContactPersonRef.current) subContactPersonRef.current.value = sub.contactPerson;
      if (subPhoneRef.current) subPhoneRef.current.value = sub.phone;
      if (subEmailRef.current) subEmailRef.current.value = sub.email || '';
      if (subAddressRef.current) subAddressRef.current.value = sub.address;
      if (subSpecializationRef.current) subSpecializationRef.current.value = sub.specialization;
    }, 0);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      ['Подрядчики'],
      ['#', 'Название компании', 'Контактное лицо', 'Телефон', 'Email', 'Адрес', 'Специализация', 'Статус'],
    ];
    filteredSubcontractors.forEach((sub, i) => {
      rows.push([
        String(i + 1),
        sub.companyName,
        sub.contactPerson,
        sub.phone,
        sub.email || '—',
        sub.address,
        sub.specialization,
        statusLabels[sub.status],
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 35 }, { wch: 25 }, { wch: 12 }];
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
    XLSX.utils.book_append_sheet(wb, ws, 'Подрядчики');
    XLSX.writeFile(wb, 'подрядчики_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handleSave = async () => {
    try {
      const body: any = {
        companyName: subCompanyNameRef.current?.value || '',
        contactPerson: subContactPersonRef.current?.value || '',
        phone: subPhoneRef.current?.value || '',
        email: subEmailRef.current?.value || null,
        address: subAddressRef.current?.value || '',
        specialization: subSpecializationRef.current?.value || '',
        status: formData.status || 'active',
      };

      if (editingSubcontractor) {
        await fetch(`/api/subcontractors/${editingSubcontractor.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setSubcontractors(prev => prev.map(sub =>
          sub.id === editingSubcontractor.id ? { ...sub, ...body } as Subcontractor : sub
        ));
      } else {
        const res = await fetch('/api/subcontractors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const newSub = await res.json();
        setSubcontractors(prev => [...prev, newSub.data]);
      }
      setIsModalOpen(false);
      setEditingSubcontractor(null);
      setFormData({});
      fetchSubcontractors();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierLoading, setSupplierLoading] = useState(true);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierFormData, setSupplierFormData] = useState<Partial<Supplier>>({});
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  // Subcontractor refs
  const subCompanyNameRef = useRef<HTMLInputElement>(null);
  const subContactPersonRef = useRef<HTMLInputElement>(null);
  const subPhoneRef = useRef<HTMLInputElement>(null);
  const subEmailRef = useRef<HTMLInputElement>(null);
  const subAddressRef = useRef<HTMLInputElement>(null);
  const subSpecializationRef = useRef<HTMLInputElement>(null);

  // Supplier refs
  const supCompanyNameRef = useRef<HTMLInputElement>(null);
  const supContactPersonRef = useRef<HTMLInputElement>(null);
  const supPhoneRef = useRef<HTMLInputElement>(null);
  const supEmailRef = useRef<HTMLInputElement>(null);
  const supAddressRef = useRef<HTMLInputElement>(null);
  const supCategoryRef = useRef<HTMLInputElement>(null);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      const list = data?.data || (Array.isArray(data) ? data : []);
      setSuppliers(list);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      setSuppliers([]);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (!supplierModalOpen) {
      if (supCompanyNameRef.current) supCompanyNameRef.current.value = '';
      if (supContactPersonRef.current) supContactPersonRef.current.value = '';
      if (supPhoneRef.current) supPhoneRef.current.value = '';
      if (supEmailRef.current) supEmailRef.current.value = '';
      if (supAddressRef.current) supAddressRef.current.value = '';
      if (supCategoryRef.current) supCategoryRef.current.value = '';
    }
  }, [supplierModalOpen]);

  const filteredSuppliers = suppliers.filter(sup =>
    sup.companyName.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
    sup.contactPerson.toLowerCase().includes(supplierSearchQuery.toLowerCase())
  );

  const supplierTotalPages = Math.ceil(filteredSuppliers.length / supplierItemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (supplierPage - 1) * supplierItemsPerPage,
    supplierPage * supplierItemsPerPage
  );

  useEffect(() => {
    setSupplierPage(1);
  }, [supplierSearchQuery, activeTab]);

  const handleSupplierDelete = async (id: number) => {
    if (!(await confirm('Удалить поставщика?'))) return;
    try {
      await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      setSuppliers(prev => prev.filter(sup => sup.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleSupplierAdd = () => {
    setEditingSupplier(null);
    setSupplierFormData({ status: 'active' });
    setSupplierModalOpen(true);
  };

  const handleSupplierEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupplierFormData({ ...sup });
    setSupplierModalOpen(true);
    setTimeout(() => {
      if (supCompanyNameRef.current) supCompanyNameRef.current.value = sup.companyName;
      if (supContactPersonRef.current) supContactPersonRef.current.value = sup.contactPerson;
      if (supPhoneRef.current) supPhoneRef.current.value = sup.phone;
      if (supEmailRef.current) supEmailRef.current.value = sup.email || '';
      if (supAddressRef.current) supAddressRef.current.value = sup.address;
      if (supCategoryRef.current) supCategoryRef.current.value = sup.category;
    }, 0);
  };

  const handleSupplierSave = async () => {
    try {
      const body: any = {
        companyName: supCompanyNameRef.current?.value || '',
        contactPerson: supContactPersonRef.current?.value || '',
        phone: supPhoneRef.current?.value || '',
        email: supEmailRef.current?.value || null,
        address: supAddressRef.current?.value || '',
        category: supCategoryRef.current?.value || '',
        status: supplierFormData.status || 'active',
      };

      if (editingSupplier) {
        await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setSuppliers(prev => prev.map(sup =>
          sup.id === editingSupplier.id ? { ...sup, ...body } as Supplier : sup
        ));
      } else {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const newSup = await res.json();
        setSuppliers(prev => [...prev, newSup.data]);
      }
      setSupplierModalOpen(false);
      setEditingSupplier(null);
      setSupplierFormData({});
      fetchSuppliers();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('subcontractors')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'subcontractors'
                ? 'border-[#1976d2] text-[#1976d2]'
                : 'border-transparent text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:text-slate-300'
            }`}>
            Подрядчики
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'suppliers'
                ? 'border-[#1976d2] text-[#1976d2]'
                : 'border-transparent text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 dark:text-slate-300'
            }`}>
            Поставщики
          </button>
        </div>

        {/* Subcontractors Tab */}
        {activeTab === 'subcontractors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Подрядчики</h1>
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
                  Добавить подрядчика
                </button>
              </div>
            </div>

            <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Поиск по названию или контакту..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название компании</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Контактное лицо</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Телефон</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Email</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Адрес</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Специализация</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Статус</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubcontractors.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                    <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{sub.companyName}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sub.contactPerson}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sub.phone}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sub.email || '—'}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sub.address}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${specializationColors[sub.specialization] || 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200'}`}>
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
        )}
      </div>
      {filteredSubcontractors.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredSubcontractors.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSubcontractor(null); setFormData({}); }}
        title={editingSubcontractor ? 'Редактировать подрядчика' : 'Новый подрядчик'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название компании</label>
            <input ref={subCompanyNameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Контактное лицо</label>
            <input ref={subContactPersonRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Телефон</label>
              <input ref={subPhoneRef} type="tel" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Email</label>
              <input ref={subEmailRef} type="email" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Адрес</label>
            <input ref={subAddressRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Специализация</label>
            <input ref={subSpecializationRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Монтажные работы" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Статус</label>
            <select
              value={formData.status || 'active'}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
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
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
          </div>
        )}

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Поставщики</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const wb = XLSX.utils.book_new();
                      const rows: string[][] = [
                        ['Поставщики'],
                        ['#', 'Название компании', 'Контактное лицо', 'Телефон', 'Email', 'Адрес', 'Категория', 'Статус'],
                      ];
                      filteredSuppliers.forEach((sup, i) => {
                        rows.push([
                          String(i + 1),
                          sup.companyName,
                          sup.contactPerson,
                          sup.phone,
                          sup.email || '—',
                          sup.address,
                          sup.category,
                          statusLabels[sup.status],
                        ]);
                      });
                      const ws = XLSX.utils.aoa_to_sheet(rows);
                      ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 35 }, { wch: 20 }, { wch: 12 }];
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
                      XLSX.utils.book_append_sheet(wb, ws, 'Поставщики');
                      XLSX.writeFile(wb, 'поставщики_' + new Date().toISOString().split('T')[0] + '.xlsx');
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Экспорт в Excel
                  </button>
                  <button
                    onClick={handleSupplierAdd}
                    className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить поставщика
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по названию или контакту..."
                  value={supplierSearchQuery}
                  onChange={(e) => setSupplierSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
                />
              </div>

              <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                {supplierLoading ? (
                  <div className="p-8 text-center text-gray-500 dark:text-slate-400 dark:text-slate-400">Загрузка...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название компании</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Контактное лицо</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Телефон</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Email</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Адрес</th>
                          <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Категория</th>
                          <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Статус</th>
                          <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSuppliers.map((sup) => (
                          <tr key={sup.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                            <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{sup.companyName}</td>
                            <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sup.contactPerson}</td>
                            <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sup.phone}</td>
                            <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sup.email || '—'}</td>
                            <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{sup.address}</td>
                            <td className="py-4 px-6 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                {sup.category}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[sup.status]}`}>
                                {statusLabels[sup.status]}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleSupplierEdit(sup)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSupplierDelete(sup.id)}
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
                )}
              </div>
              {filteredSuppliers.length > 0 && (
                <Pagination
                  currentPage={supplierPage}
                  totalPages={supplierTotalPages}
                  onPageChange={setSupplierPage}
                  totalItems={filteredSuppliers.length}
                  itemsPerPage={supplierItemsPerPage}
                />
              )}

              <Modal
                isOpen={supplierModalOpen}
                onClose={() => { setSupplierModalOpen(false); setEditingSupplier(null); setSupplierFormData({}); }}
                title={editingSupplier ? 'Редактировать поставщика' : 'Новый поставщик'}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название компании</label>
                    <input ref={supCompanyNameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Контактное лицо</label>
                    <input ref={supContactPersonRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Телефон</label>
                      <input ref={supPhoneRef} type="tel" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Email</label>
                      <input ref={supEmailRef} type="email" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Адрес</label>
                    <input ref={supAddressRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Категория</label>
                    <input ref={supCategoryRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Материалы, Оборудование" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Статус</label>
                    <select
                      value={supplierFormData.status || 'active'}
                      onChange={e => setSupplierFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                    >
                      <option value="active">Активен</option>
                      <option value="inactive">Неактивен</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSupplierSave}
                      className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => { setSupplierModalOpen(false); setEditingSupplier(null); setSupplierFormData({}); }}
                      className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </Modal>
            </div>
          )}
      </div>
  );
}
