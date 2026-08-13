'use client';

import { useState } from 'react';
import { Wrench, HardHat, Truck, FileText, Trash2, Calendar, Search, Download } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { exportReportsToPDF, exportSingleReportToPDF } from '@/shared/lib/pdfExport';

const shopEmployees = [
  { id: 1, fullName: 'Иванов Иван Иванович', workplace: 'цех', paymentType: 'сменная' },
  { id: 3, fullName: 'Сидоров Алексей Дмитриевич', workplace: 'цех', paymentType: 'сдельная' },
  { id: 5, fullName: 'Морозова Анна Владимировна', workplace: 'цех', paymentType: 'сдельная' },
  { id: 7, fullName: 'Волкова Елена Игоревна', workplace: 'цех', paymentType: 'сменная' },
];

const workTypeRates: Record<string, number> = {
  сосна: 350,
  липа: 400,
  утепление: 400,
  каркасы: 1000,
  стропила: 900,
  обшивкаСтропил: 300,
};

const dailyRate = 2000;

const reportCards = [
  {
    id: 'цех',
    title: 'Отчет цеха',
    description: 'Отчет о работе цеха за период',
    icon: Wrench,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    id: 'монтаж',
    title: 'Отчет монтажа',
    description: 'Отчет о монтажных работах за период',
    icon: HardHat,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-50',
  },
  {
    id: 'склад',
    title: 'Отчет складлера',
    description: 'Отчет о складских операциях за период',
    icon: Truck,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-50',
  },
];

export interface ReportEntry {
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
}

const initialReports: ReportEntry[] = [
  {
    id: 1,
    type: 'цех',
    date: '2026-07-29',
    periodStart: '2026-07-29',
    periodEnd: '2026-07-29',
    workDone: 'Изготовление каркасов для 3 бань',
    materials: 'Доска 50x150мм - 2м³, брус 150x150мм - 0.5м³',
    notes: 'Работа выполнена в срок',
    employeeId: 1,
    employeeName: 'Иванов Иван Иванович',
    employeePaymentType: 'сменная',
    hours: 8,
    squareMeters: { сосна: 45, липа: 20, утепление: 35, каркасы: 60, стропила: 0, обшивкаСтропил: 0 },
    createdAt: '2026-07-29T17:00:00',
  },
  {
    id: 2,
    type: 'монтаж',
    date: '2026-07-29',
    periodStart: '2026-07-29',
    periodEnd: '2026-07-29',
    workDone: 'Монтаж фундамента на объекте "Дом Петров"',
    materials: 'Бетон М300 - 15м³, арматура 12мм - 200кг',
    notes: '',
    squareMeters: { сосна: 0, липа: 0, утепление: 0, каркасы: 0, стропила: 0, обшивкаСтропил: 0 },
    createdAt: '2026-07-29T16:30:00',
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>(initialReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    workDone: '',
    materials: '',
    notes: '',
    employeeId: '' as number | '',
    hours: 8,
  });
  const [squareMeters, setSquareMeters] = useState({
    сосна: 0,
    липа: 0,
    утепление: 0,
    каркасы: 0,
    стропила: 0,
    обшивкаСтропил: 0,
  });
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  const filteredReports = reports.filter(r => {
    const matchesDate = !filterDate || r.date === filterDate;
    const matchesName = !filterName || (r.employeeName && r.employeeName.toLowerCase().includes(filterName.toLowerCase()));
    return matchesDate && matchesName;
  });

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
      hours: 8,
    });
    setSquareMeters({
      сосна: 0,
      липа: 0,
      утепление: 0,
      каркасы: 0,
      стропила: 0,
      обшивкаСтропил: 0,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const typeMap: Record<string, string> = {
      цех: 'цех',
      монтаж: 'монтаж',
      склад: 'склад',
    };
    const newId = Math.max(...reports.map(r => r.id), 0) + 1;
    const selectedEmployee = formData.employeeId ? shopEmployees.find(e => e.id === formData.employeeId) : undefined;
    const newReport: ReportEntry = {
      ...formData,
      id: newId,
      type: typeMap[selectedReportType] || selectedReportType,
      createdAt: new Date().toISOString(),
      squareMeters: selectedReportType === 'цех' ? squareMeters : { сосна: 0, липа: 0, утепление: 0, каркасы: 0, стропила: 0, обшивкаСтропил: 0 },
      employeeId: selectedReportType === 'цех' && formData.employeeId ? formData.employeeId : undefined,
      employeeName: selectedReportType === 'цех' ? selectedEmployee?.fullName : undefined,
      employeePaymentType: selectedReportType === 'цех' ? selectedEmployee?.paymentType : undefined,
      hours: selectedReportType === 'цех' ? formData.hours : undefined,
    };
    setReports(prev => [newReport, ...prev]);
    setIsModalOpen(false);
    setSelectedReportType('');
  };

  const handleDelete = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const calculateEarnings = (report: ReportEntry) => {
    if (report.type !== 'цех') return 0;
    if (report.employeePaymentType === 'сдельная') {
      let total = 0;
      for (const [key, value] of Object.entries(report.squareMeters)) {
        total += value * (workTypeRates[key] || 0);
      }
      return total;
    }
    if (report.employeePaymentType === 'сменная' && report.hours) {
      return report.hours * dailyRate;
    }
    return 0;
  };

  const typeLabels: Record<string, string> = {
    цех: 'Отчет цеха',
    монтаж: 'Отчет монтажа',
    склад: 'Отчет складлера',
  };

  const typeColors: Record<string, string> = {
    цех: 'bg-blue-100 text-blue-800',
    монтаж: 'bg-purple-100 text-purple-800',
    склад: 'bg-green-100 text-green-800',
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'цех': return <Wrench className="w-4 h-4" />;
      case 'монтаж': return <HardHat className="w-4 h-4" />;
      case 'склад': return <Truck className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Отчеты</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => handleOpenModal(card.id)}
              className={`${card.hoverColor} bg-white rounded-lg shadow-md p-8 text-left transition-all hover:shadow-lg`}
            >
              <div className={`w-16 h-16 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
            placeholder="Фильтр по дате"
          />
        </div>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Поиск по ФИО сотрудника..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900"
          />
        </div>
        {filteredReports.length > 0 && (
          <button
            onClick={() => exportReportsToPDF(filteredReports)}
            className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Экспорт PDF
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Последние отчеты</h2>
          {filteredReports.length > 0 && (
            <span className="text-sm text-gray-500">Всего: {filteredReports.length}</span>
          )}
        </div>
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Отчеты не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${typeColors[report.type] || 'bg-gray-100 text-gray-800'}`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{typeLabels[report.type] || report.type}</p>
                      <p className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString('ru-RU')} в {new Date(report.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportSingleReportToPDF(report)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                      title="Экспорт в PDF"
                    >
                      <Download className="w-4 h-4" />
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
                    <p className="text-sm text-gray-500 mb-1">Период</p>
                    <p className="text-gray-900">
                      {new Date(report.periodStart).toLocaleDateString('ru-RU')} - {new Date(report.periodEnd).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Дата составления</p>
                    <p className="text-gray-900">{new Date(report.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                {(report.type === 'цех' && report.employeeName) && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Сотрудник</p>
                    <p className="text-gray-900">{report.employeeName}</p>
                  </div>
                )}
                {report.type === 'цех' && (report.squareMeters.сосна || report.squareMeters.липа || report.squareMeters.утепление || report.squareMeters.каркасы || report.squareMeters.стропила || report.squareMeters.обшивкаСтропил) && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Квадратура (м²)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {report.squareMeters.сосна > 0 && <div className="bg-blue-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Сосна:</span> <span className="font-medium">{report.squareMeters.сосна} м²</span></div>}
                      {report.squareMeters.липа > 0 && <div className="bg-amber-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Липа:</span> <span className="font-medium">{report.squareMeters.липа} м²</span></div>}
                      {report.squareMeters.утепление > 0 && <div className="bg-green-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Утепление:</span> <span className="font-medium">{report.squareMeters.утепление} м²</span></div>}
                      {report.squareMeters.каркасы > 0 && <div className="bg-purple-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Каркасы:</span> <span className="font-medium">{report.squareMeters.каркасы} м²</span></div>}
                      {report.squareMeters.стропила > 0 && <div className="bg-orange-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Стропила:</span> <span className="font-medium">{report.squareMeters.стропила} м²</span></div>}
                      {report.squareMeters.обшивкаСтропил > 0 && <div className="bg-teal-50 px-3 py-1 rounded"><span className="text-xs text-gray-500">Обшивка стропил:</span> <span className="font-medium">{report.squareMeters.обшивкаСтропил} м²</span></div>}
                    </div>
                  </div>
                )}
                {report.type === 'цех' && (() => {
                  const earnings = calculateEarnings(report);
                  if (earnings > 0) {
                    return (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 mb-1">Заработок</p>
                        <p className="text-lg font-bold text-green-600">{earnings.toLocaleString('ru-RU')} ₽</p>
                        <p className="text-xs text-gray-400">
                          {report.employeePaymentType === 'сдельная' ? 'сдельная оплата' : `сменная оплата (${report.hours} ч × ${dailyRate} ₽/ч)`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">Выполненные работы</p>
                  <p className="text-gray-900">{report.workDone}</p>
                </div>
                {report.materials && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Материалы</p>
                    <p className="text-gray-900">{report.materials}</p>
                  </div>
                )}
                {report.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Примечания</p>
                    <p className="text-gray-900">{report.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedReportType(''); }}
        title={`Создать ${typeLabels[selectedReportType] || 'отчет'}`}
      >
        <div className="space-y-4">
          {selectedReportType === 'цех' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сотрудник цеха</label>
              <select
                value={formData.employeeId}
                onChange={e => setFormData(prev => ({ ...prev, employeeId: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              >
                <option value="">Выберите сотрудника</option>
                {shopEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                ))}
              </select>
            </div>
          )}
          {selectedReportType === 'цех' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Квадратура по видам работ (м²)</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'сосна', label: 'Сосна' },
                  { key: 'липа', label: 'Липа' },
                  { key: 'утепление', label: 'Утепление' },
                  { key: 'каркасы', label: 'Каркасы' },
                  { key: 'стропила', label: 'Стропила' },
                  { key: 'обшивкаСтропил', label: 'Обшивка стропил' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{label}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={squareMeters[key as keyof typeof squareMeters] || ''}
                      onChange={e => setSquareMeters(prev => ({
                        ...prev,
                        [key]: Number(e.target.value) || 0
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedReportType === 'цех' && (() => {
            const selectedEmp = shopEmployees.find(e => e.id === formData.employeeId);
            if (selectedEmp?.paymentType === 'сменная') {
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Количество часов</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.hours || 8}
                    onChange={e => setFormData(prev => ({ ...prev, hours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                  />
                </div>
              );
            }
            return null;
          })()}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата отчета</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Период с</label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={e => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Период по</label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={e => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Выполненные работы</label>
            <textarea
              rows={4}
              placeholder="Опишите выполненные работы..."
              value={formData.workDone}
              onChange={e => setFormData(prev => ({ ...prev, workDone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Использованные материалы</label>
            <input
              type="text"
              placeholder="Укажите использованные материалы..."
              value={formData.materials}
              onChange={e => setFormData(prev => ({ ...prev, materials: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Примечания</label>
            <textarea
              rows={3}
              placeholder="Дополнительные заметки..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsModalOpen(false); setSelectedReportType(''); }}
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
