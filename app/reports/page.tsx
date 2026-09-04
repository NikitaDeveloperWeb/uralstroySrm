'use client';

import { useState, useEffect } from 'react';
import { Wrench, FileText, Trash2, Calendar, Search, Download, Loader2, X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';
import { exportReportsToPDF, exportSingleReportToPDF } from '@/shared/lib/pdfExport';
import { fetchShopReports, createShopReport, fetchEmployeesWithSdelnaya, fetchUnitRatesForEmployee } from '@/shared/lib/shop-reports-api';
import * as XLSX from 'xlsx';

interface Employee {
  id: number;
  fullName: string;
  workplace?: string;
  paymentType?: string;
}

interface UnitRate {
  id: number;
  name: string;
  pricePerUnit: number;
  category?: string;
}

interface ShopReportItem {
  id?: number;
  workTypeId?: number;
  workName: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ShopReport {
  id: number;
  employeeId: number;
  employee: Employee;
  projectId: number | null;
  project: { id: number; name: string } | null;
  date: string;
  periodFrom: string;
  periodTo: string;
  comment: string | null;
  items: ShopReportItem[];
  totalAmount: number;
  createdAt: string;
}

interface ReportEntry {
  id: number;
  type: string;
  date: string;
  periodStart: string;
  periodEnd: string;
  workDone: string;
  materials: string;
  notes: string;
  employeeId?: number;
  employeeName?: string;
  employeePaymentType?: string;
  hours?: number;
  squareMeters: {
    сосна: number;
    липа: number;
    утепление: number;
    каркасы: number;
    стропила: number;
    обшивкаСтропил: number;
  };
  createdAt: string;
  totalAmount?: number;
  items?: Array<{
    id?: number;
    workName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

const reportCards = [
  {
    id: 'цех',
    title: 'Отчет цеха',
    description: 'Отчет о работе цеха за период',
    icon: Wrench,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50',
  },
];

const typeLabels: Record<string, string> = {
  цех: 'Отчет цеха',
};

const typeColors: Record<string, string> = {
  цех: 'bg-blue-100 text-blue-800',
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [shopReports, setShopReports] = useState<ShopReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [unitRates, setUnitRates] = useState<UnitRate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    workDone: '',
    materials: '',
    notes: '',
    employeeId: '' as number | '',
    projectId: '' as number | '',
  });
  const [reportItems, setReportItems] = useState<ShopReportItem[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const REPORTS_PER_PAGE = 10;
  const [isExporting, setIsExporting] = useState(false);
  const { alert, confirm } = useAlert();

  useEffect(() => {
    loadReports();
    loadEmployees();
    loadUnitRates();
  }, []);

  const loadReports = async () => {
    try {
      const data = await fetchShopReports();
      setShopReports(data);
      const converted = data.map((r: ShopReport) => ({
        id: r.id,
        type: 'цех',
        date: new Date(r.date).toISOString().split('T')[0],
        periodStart: new Date(r.periodFrom).toISOString().split('T')[0],
        periodEnd: new Date(r.periodTo).toISOString().split('T')[0],
        workDone: r.comment || '',
        materials: '',
        notes: '',
        employeeId: r.employeeId,
        employeeName: r.employee.fullName,
        employeePaymentType: r.employee.paymentType,
        squareMeters: {
          сосна: 0,
          липа: 0,
          утепление: 0,
          каркасы: 0,
          стропила: 0,
          обшивкаСтропил: 0,
        },
        createdAt: r.createdAt,
        totalAmount: r.totalAmount,
      }));
      setReports(converted);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployeesWithSdelnaya();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadUnitRates = async () => {
    try {
      const data = await fetchUnitRatesForEmployee();
      setUnitRates(data);
    } catch (error) {
      console.error('Error loading unit rates:', error);
    }
  };

  const handleOpenModal = (type: string) => {
    setSelectedReportType(type);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      workDone: '',
      materials: '',
      notes: '',
      employeeId: '',
      projectId: '',
    });
    setReportItems([]);
    setIsModalOpen(true);
  };

  const addReportItem = () => {
    setReportItems(prev => [...prev, { workName: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeReportItem = (index: number) => {
    setReportItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateReportItem = (index: number, field: keyof ShopReportItem, value: string | number) => {
    setReportItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = Math.round(updated.quantity * updated.rate * 100) / 100;
      }
      return updated;
    }));
  };

  const handleSave = async () => {
    if (selectedReportType !== 'цех') return;
    if (!formData.employeeId) {
      alert('Выберите сотрудника');
      return;
    }
    if (reportItems.length === 0) {
      alert('Добавьте хотя бы одну работу');
      return;
    }
    if (reportItems.some(item => item.amount <= 0 || item.quantity <= 0 || item.rate <= 0)) {
      alert('Проверьте корректность данных');
      return;
    }

    setSaving(true);
    try {
      await createShopReport({
        employeeId: formData.employeeId as number,
        projectId: formData.projectId ? Number(formData.projectId) : undefined,
        date: formData.date,
        periodFrom: formData.periodStart,
        periodTo: formData.periodEnd,
        comment: formData.workDone,
        items: reportItems,
      });
      await loadReports();
      setIsModalOpen(false);
      setSelectedReportType('');
    } catch (error: any) {
      alert(error.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      ['Отчеты цеха'],
      ['#', 'Сотрудник', 'Период с', 'Период по', 'Дата', 'Выполненные работы', 'Заработок'],
    ];
    filteredReports.forEach((report, i) => {
      rows.push([
        String(i + 1),
        report.employeeName || '—',
        new Date(report.periodStart).toLocaleDateString('ru-RU'),
        new Date(report.periodEnd).toLocaleDateString('ru-RU'),
        new Date(report.date).toLocaleDateString('ru-RU'),
        report.workDone || '—',
        report.totalAmount ? report.totalAmount.toLocaleString('ru-RU') + ' ₽' : '—',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 40 }, { wch: 15 }];
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
    XLSX.utils.book_append_sheet(wb, ws, 'Отчеты');
    XLSX.writeFile(wb, 'отчеты_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm('Удалить отчет?'))) return;
    try {
      await fetch(`/api/shop-reports/${id}`, { method: 'DELETE' });
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesDate = !filterDate || r.date === filterDate;
    const matchesName = !filterName || (r.employeeName && r.employeeName.toLowerCase().includes(filterName.toLowerCase()));
    return matchesDate && matchesName;
  });

  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE) || 1;
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * REPORTS_PER_PAGE,
    currentPage * REPORTS_PER_PAGE,
  );

  const getTypeIcon = (type: string) => {
    if (type === 'цех') return <Wrench className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Отчеты</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleOpenModal(card.id)}
              className={`${card.hoverColor} bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-8 text-left transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700 dark:border-slate-700 dark:border-slate-700`}
            >
              <div className={`w-16 h-16 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white mb-2">{card.title}</h3>
              <p className="text-gray-600 dark:text-slate-300 dark:text-slate-300 dark:text-slate-400">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Calendar className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white dark:bg-slate-700 dark:text-white"
            placeholder="Фильтр по дате"
          />
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Поиск по ФИО сотрудника..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white dark:bg-slate-700 dark:text-white"
          />
        </div>
        {filteredReports.length > 0 && (
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            Экспорт в Excel
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Последние отчеты</h2>
          {filteredReports.length > 0 && (
            <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">Всего: {filteredReports.length}</span>
          )}
        </div>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-gray-400 dark:text-slate-500 dark:text-slate-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-lg">Загрузка...</p>
          </div>
        ) : paginatedReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 dark:text-slate-500 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-lg">Отчеты не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div key={report.id} className="p-6 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-750 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[report.type] || 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200'}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white dark:text-white dark:text-white">{typeLabels[report.type] || report.type}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400">{new Date(report.createdAt).toLocaleDateString('ru-RU')} в {new Date(report.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const wb = XLSX.utils.book_new();
                        const rows: string[][] = [
                          ['Отчет цеха'],
                          ['Сотрудник', report.employeeName || '—'],
                          ['Период', new Date(report.periodStart).toLocaleDateString('ru-RU') + ' - ' + new Date(report.periodEnd).toLocaleDateString('ru-RU')],
                          ['Дата', new Date(report.date).toLocaleDateString('ru-RU')],
                          ['Выполненные работы', report.workDone || '—'],
                          ['Заработок', report.totalAmount ? report.totalAmount.toLocaleString('ru-RU') + ' ₽' : '—'],
                        ];
                        if (report.items && report.items.length > 0) {
                          rows.push([]);
                          rows.push(['Детализация работ']);
                          rows.push(['Работа', 'м²', 'Ставка', 'Сумма']);
                          report.items.forEach(item => {
                            rows.push([item.workName, String(item.quantity), item.rate.toLocaleString('ru-RU') + ' ₽', item.amount.toLocaleString('ru-RU') + ' ₽']);
                          });
                        }
                        const ws = XLSX.utils.aoa_to_sheet(rows);
                        ws['!cols'] = [{ wch: 30 }, { wch: 40 }];
                        XLSX.utils.book_append_sheet(wb, ws, 'Отчет #' + report.id);
                        XLSX.writeFile(wb, 'отчет_' + report.id + '_' + report.date + '.xlsx');
                      }}
                      className="text-green-600 hover:text-green-800 transition-colors p-2 hover:bg-green-50 rounded-lg"
                      title="Экспорт в Excel"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Удалить отчет"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Период</p>
                    <p className="text-gray-900 dark:text-white dark:text-white">
                      {new Date(report.periodStart).toLocaleDateString('ru-RU')} - {new Date(report.periodEnd).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Дата составления</p>
                    <p className="text-gray-900 dark:text-white dark:text-white">{new Date(report.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                {(report.type === 'цех' && report.employeeName) && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Сотрудник</p>
                                <p className="text-gray-900 dark:text-white dark:text-white">{report.employeeName}</p>
                              </div>
                            )}
                            {report.totalAmount && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Заработок</p>
                                <p className="text-lg font-bold text-green-600">{report.totalAmount.toLocaleString('ru-RU')} ₽</p>
                              </div>
                            )}
                            <div className="mb-3">
                              <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Выполненные работы</p>
                              <p className="text-gray-900 dark:text-white dark:text-white">{report.workDone}</p>
                            </div>
                            {report.items && report.items.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Детализация работ</p>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
                                        <th className="text-left py-2 text-gray-500 dark:text-slate-400 dark:text-slate-400">Работа</th>
                                        <th className="text-right py-2 text-gray-500 dark:text-slate-400 dark:text-slate-400">м²</th>
                                        <th className="text-right py-2 text-gray-500 dark:text-slate-400 dark:text-slate-400">Ставка</th>
                                        <th className="text-right py-2 text-gray-500 dark:text-slate-400 dark:text-slate-400">Сумма</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {report.items.map((item, idx) => (
                                        <tr key={item.id ?? idx} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700">
                                          <td className="py-1">{item.workName}</td>
                                          <td className="text-right py-1">{item.quantity}</td>
                                          <td className="text-right py-1">{item.rate.toLocaleString('ru-RU')} ₽</td>
                                          <td className="text-right py-1 font-medium">{item.amount.toLocaleString('ru-RU')} ₽</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {filteredReports.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={filteredReports.length}
                      itemsPerPage={REPORTS_PER_PAGE}
                    />
                  )}

                  <Modal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedReportType(''); }}
                    title={`Создать ${typeLabels[selectedReportType] || 'отчет'}`}
                  >
                    <div className="space-y-4">
                      {selectedReportType === 'цех' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Сотрудник цеха</label>
                            <select
                              value={formData.employeeId}
                              onChange={e => setFormData(prev => ({ ...prev, employeeId: Number(e.target.value) }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Выберите сотрудника</option>
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300">Виды работ</label>
                              <button
                                type="button"
                                onClick={addReportItem}
                                className="text-sm text-[#1976d2] hover:text-[#1565c0] font-medium"
                              >
                                + Добавить работу
                              </button>
                            </div>
                            <div className="space-y-3">
                              {reportItems.map((item, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700 dark:border-slate-700">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300">Работа #{index + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeReportItem(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    <select
                                      value=""
                                      onChange={e => {
                                        const rate = unitRates.find(r => r.id === Number(e.target.value));
                                        if (rate) {
                                          updateReportItem(index, 'workName', rate.name);
                                          updateReportItem(index, 'rate', rate.pricePerUnit);
                                        }
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                    >
                                      <option value="">Выберите из расценок</option>
                                      {unitRates.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.pricePerUnit} ₽/м²)</option>
                                      ))}
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Название работы"
                                      value={item.workName}
                                      onChange={e => updateReportItem(index, 'workName', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">м²</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.1"
                                          value={item.quantity || ''}
                                          onChange={e => updateReportItem(index, 'quantity', Number(e.target.value))}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Ставка ₽/м²</label>
                                        <input
                                          type="number"
                                          min="0"
                                          step="1"
                                          value={item.rate || ''}
                                          onChange={e => updateReportItem(index, 'rate', Number(e.target.value))}
                                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                                          placeholder="0"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-1">Сумма ₽</label>
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 rounded-lg text-right font-medium text-gray-900 dark:text-white dark:text-white">
                                          {item.amount.toLocaleString('ru-RU')}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {reportItems.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 dark:text-slate-400 text-center py-4">Нет добавленных работ</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Дата отчета</label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Период с</label>
                              <input
                                type="date"
                                value={formData.periodStart}
                                onChange={e => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Период по</label>
                              <input
                                type="date"
                                value={formData.periodEnd}
                                onChange={e => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Выполненные работы</label>
                            <textarea
                              rows={3}
                              placeholder="Опишите выполненные работы..."
                              value={formData.workDone}
                              onChange={e => setFormData(prev => ({ ...prev, workDone: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Примечания</label>
                            <textarea
                              rows={2}
                              placeholder="Дополнительные заметки..."
                              value={formData.notes}
                              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
                            />
                          </div>
                          <div className="flex gap-4 pt-4">
                            <button
                              onClick={handleSave}
                              disabled={saving}
                              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] disabled:bg-gray-400 dark:bg-slate-600 dark:bg-slate-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                              {saving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                              onClick={() => { setIsModalOpen(false); setSelectedReportType(''); }}
                              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
                              disabled={saving}
                            >
                              Отмена
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Modal>
                </div>
              );
            }
