'use client';

import { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

function extractNumber(str: string): number {
  if (!str) return 1;
  const match = String(str).match(/[\d.]+/);
  if (!match) return 1;
  const num = parseFloat(match[0]);
  return isNaN(num) ? 1 : num;
}
import { formatCurrency } from '@/shared/components/projects/projectDetailUtils';
import { Modal } from '@/shared/components/ui/Modal';
import type { Project, ProjectMaterial, ProjectCompletedWork } from '@/shared/types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  materials?: ProjectMaterial[];
  completedWorks?: ProjectCompletedWork[];
  overheads?: { id?: number; name: string; cost: number; category?: string | null }[];
  maxWidth?: string;
  maxHeight?: string;
}

function CollapsibleSection({ title, items, total, defaultOpen = false }: {
  title: string;
  items: { name: string; quantity?: string; cost: number; category?: string | null }[];
  total: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800 dark:text-slate-200 dark:text-slate-200">{title}</span>
          <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">{items.length} поз.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 dark:text-white dark:text-white">{formatCurrency(total)} ₽</span>
          <svg className={`w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-slate-700 dark:border-slate-700">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 dark:text-slate-500 dark:text-slate-500 text-center">Нет данных</p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-slate-700 dark:divide-slate-700">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 dark:text-slate-200 truncate">{item.name}</p>
                    {item.quantity && <p className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500">{item.quantity}</p>}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300 ml-4">{formatCurrency(item.cost)} ₽</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportModal({ isOpen, onClose, project, materials = [], completedWorks = [], overheads = [], maxWidth = 'max-w-3xl', maxHeight = 'max-h-[70vh]' }: Props) {
  const [reportNumber, setReportNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [marginPercent, setMarginPercent] = useState(15);

  const materialsTotal = useMemo(() => {
    let total = 0;
    for (const m of materials) {
      const qty = extractNumber(m.quantity);
      const cost = typeof m.cost === 'number' ? m.cost : parseFloat(String(m.cost || 0));
      if (!isNaN(qty) && !isNaN(cost)) {
        total += qty * cost;
      }
    }

    return total;
  }, [materials]);

  const worksTotal = useMemo(() => {
    let total = 0;
    for (const w of completedWorks) {
      const qty = extractNumber(w.quantity);
      const cost = typeof w.cost === 'number' ? w.cost : parseFloat(String(w.cost || 0));
      if (!isNaN(qty) && !isNaN(cost)) {
        total += qty * cost;
      }
    }
    return total;
  }, [completedWorks]);

  const overheadsTotal = useMemo(() => overheads.reduce((sum, h) => sum + (h.cost || 0), 0), [overheads]);
  const grandTotal = materialsTotal + worksTotal + overheadsTotal;

  const projectCost = project?.cost || 0;
  const profit = projectCost - grandTotal;
  const profitPercent = projectCost > 0 ? Math.round((profit / projectCost) * 100) : 0;
  const isLoss = profit < 0;

  const daysInWork = useMemo(() => {
    if (!project || project.status !== 'в работе') return null;
    const start = new Date(project.createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }, [project, project?.createdAt, project?.status]);

  if (!project) return null;

  const handleCreate = async () => {
    if (!project) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/project-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          date: new Date().toISOString(),
          periodFrom: new Date().toISOString(),
          periodTo: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setReportNumber(`#${data.data.id}`);
        setCreated(true);
      }
    } catch (e) {
      console.error('Ошибка создания отчета:', e);
    } finally {
      setIsCreating(false);
    }
  };





  const handleExportExcel = () => {
    if (!project) return;
    const sections = [
      { title: 'Материалы', items: materials },
      { title: 'Выполненные работы', items: completedWorks },
      { title: 'Общие расходы', items: overheads.map(h => ({ name: h.name, quantity: '1', cost: h.cost, category: h.category })) },
    ];

    const wb = XLSX.utils.book_new();

    // Заголовок
    const headerRows: string[][] = [
      ['Отчет по объекту'],
      ['Объект:', project.name],
      ['Адрес:', project.address || '—'],
      ['Стоимость объекта:', formatCurrency(projectCost) + ' ₽'],
      ['Дата:', new Date().toLocaleDateString('ru-RU')],
      [],
    ];

    // Данные
    const dataRows: string[][] = [
      ['Раздел', 'Наименование', 'Количество', 'Категория', 'Цена за ед.', 'Сумма'],
    ];

    for (const section of sections) {
      dataRows.push(['', section.title, '', '', '', '']);
      let sectionSum = 0;
      for (const item of section.items) {
        const qty = extractNumber(item.quantity);
        const price = item.cost || 0;
        const amount = Math.round(qty * price * 100) / 100;
        sectionSum += amount;
        dataRows.push([section.title, item.name, String(item.quantity), String(item.category || '—'), String(price), String(amount)]);
      }
      dataRows.push(['', 'Итого за ' + section.title, '', '', '', String(sectionSum)]);
    }

    dataRows.push([]);
    dataRows.push(['', 'ИТОГО', '', '', '', String(grandTotal)]);
    dataRows.push(['', 'Прибыль', '', '', '', String(profit)]);

    const ws = XLSX.utils.aoa_to_sheet(headerRows.concat(dataRows));

    // Ширина столбцов
    ws['!cols'] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
    ];

    // Границы ячеек
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const borderStyle = { style: 'thin', color: { rgb: '000000' } };
    const headerBorder = { ...borderStyle, font: { bold: true } };
    const boldBorder = { ...borderStyle, font: { bold: true } };

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        if (!ws[addr].b) {
          ws[addr].b = true;
        }
        // Границы
        if (!ws[addr].s) ws[addr].s = {};
        ws[addr].s.border = {
          top: borderStyle,
          bottom: borderStyle,
          left: borderStyle,
          right: borderStyle,
        };
        // Заголовок
        if (R === 0 && C === 0) {
          ws[addr].s.font = { bold: true, sz: 14 };
          ws[addr].s.fill = { fgColor: { rgb: '1976d2' } };
          ws[addr].s.font.color = { rgb: 'ffffff' };
        }
        // Строка "Раздел, Наименование..."
        if (R === headerRows.length && C === 0) {
          ws[addr].s.font = { bold: true };
        }
        // Итого строки
        if (R > headerRows.length && ws[addr].v !== undefined && typeof ws[addr].v === 'string' && ws[addr].v.includes('Итого')) {
          ws[addr].s.font = { bold: true };
        }
        // ИТОГО и Прибыль
        if (R > headerRows.length && ws[addr].v !== undefined && typeof ws[addr].v === 'string' && (ws[addr].v === 'ИТОГО' || ws[addr].v === 'Прибыль')) {
          ws[addr].s.font = { bold: true, sz: 11 };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Отчет');
    const fileName = 'отчет_' + project.name.replace(/\s+/g, '_') + '_' + new Date().toISOString().split('T')[0] + '.xlsx';
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Отчет: ${project.name}`} maxWidth={maxWidth} maxHeight={maxHeight}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Информация об объекте */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoBlock label="Адрес" value={project.address} />
          <InfoBlock label="Стоимость объекта" value={`${formatCurrency(projectCost)} ₽`} />
          <InfoBlock label="Статус" value={project.status.charAt(0).toUpperCase() + project.status.slice(1)} />
          <InfoBlock label="В работе" value={daysInWork !== null ? `${daysInWork} дн.` : '—'} />
        </div>

        {/* Сметы */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">Сметы</h3>

          <CollapsibleSection
            title="Материалы"
            items={materials.map(m => ({ name: m.name, quantity: m.quantity, cost: m.cost }))}
            total={materialsTotal}
          />

          <CollapsibleSection
            title="Выполненные работы"
            items={completedWorks.map(w => ({ name: w.name, quantity: w.quantity, cost: w.cost }))}
            total={worksTotal}
          />

          <CollapsibleSection
            title="Общие расходы"
            items={overheads.map(h => ({ name: h.name, cost: h.cost }))}
            total={overheadsTotal}
          />
        </div>

        {/* Итого */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">Итого по отчету</span>
            <span className="text-2xl font-black text-blue-700 dark:text-blue-400 dark:text-blue-400">{formatCurrency(grandTotal)} ₽</span>
          </div>
        </div>

        {/* Расчет прибыли */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-700 dark:border-green-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white mb-4">Расчет прибыли</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300">Стоимость объекта</span>
              <span className="font-semibold text-gray-900 dark:text-white dark:text-white">{formatCurrency(projectCost)} ₽</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300">Общие расходы</span>
              <span className="font-semibold text-gray-900 dark:text-white dark:text-white">− {formatCurrency(grandTotal)} ₽</span>
            </div>

            <div className="border-t border-green-200 dark:border-green-700 dark:border-green-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">Чистая прибыль</span>
                <span className={`text-2xl font-black ${isLoss ? 'text-red-600 dark:text-red-400 dark:text-red-400' : 'text-green-700 dark:text-green-400 dark:text-green-400'}`}>
                  {formatCurrency(Math.abs(profit))} ₽
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">Маржинальность</span>
                <span className={`text-sm font-bold ${isLoss ? 'text-red-600 dark:text-red-400 dark:text-red-400' : 'text-green-700 dark:text-green-400 dark:text-green-400'}`}>
                  {profitPercent}%
                </span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">
                Примерная маржа: <span className="font-bold text-[#1976d2] dark:text-blue-400 dark:text-blue-400">{marginPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1976d2]"
              />
              <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 mt-1">
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleExportExcel}
            disabled={created}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Экспорт в Excel
          </button>
          {!created ? (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {isCreating ? 'Создание...' : '📝 Создать отчет'}
            </button>
          ) : (
            <div className="flex-1 bg-green-100 dark:bg-green-900/30 dark:bg-green-900/30 border border-green-300 dark:border-green-700 dark:border-green-700 rounded-lg p-4 text-center">
              <p className="text-sm text-green-800 dark:text-green-300 dark:text-green-300 mb-1">Отчет создан</p>
              <p className="text-xl font-black text-green-700 dark:text-green-400 dark:text-green-400">{reportNumber}</p>
            </div>
          )}
          <button
            onClick={() => { if (created) setCreated(false); onClose(); }}
            className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            {created ? 'Закрыть' : 'Закрыть'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800 dark:bg-slate-800 rounded-lg p-3">
      <p className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 dark:text-slate-200 truncate">{value}</p>
    </div>
  );
}
