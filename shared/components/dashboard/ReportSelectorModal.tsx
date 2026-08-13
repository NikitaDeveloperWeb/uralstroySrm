'use client';

import { useState } from 'react';
import { X, FileText, Building2, Wallet, Users, ShoppingCart, Clock, HardHat, Truck, Wrench } from 'lucide-react';

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  color: string;
}

const reportOptions: ReportOption[] = [
  {
    id: 'object-report',
    title: 'Отчет по объекту',
    description: 'Затраты, предоплата, полная оплата, приход денег и авансы по конкретному объекту',
    icon: <Building2 className="w-8 h-8" />,
    category: 'Объекты иConstruction',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'advance-report',
    title: 'Авансовый отчет',
    description: 'Кому, сколько и когда выдан аванс с деталями и статусами',
    icon: <Wallet className="w-8 h-8" />,
    category: 'Объекты иConstruction',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'salary-report',
    title: 'Зарплатный отчет',
    description: 'Зарплаты сотрудников: начисления, выплаты, остатки за период',
    icon: <Users className="w-8 h-8" />,
    category: 'Финансы',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'daily-expenses-report',
    title: 'Ежедневные расходы',
    description: 'Все расходы за день: покупки, бензин, расходники и прочее',
    icon: <ShoppingCart className="w-8 h-8" />,
    category: 'Финансы',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'daily-earnings-report',
    title: 'Заработок за день',
    description: 'Сколько заработали рабочие за сегодня на основе отчетов сотрудников',
    icon: <Clock className="w-8 h-8" />,
    category: 'Финансы',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'shop-report',
    title: 'Отчет цеха',
    description: 'Отчет о работе цеха: квaдратура, материалы, часы сотрудников',
    icon: <Wrench className="w-8 h-8" />,
    category: 'Производство',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'installation-report',
    title: 'Отчет монтажа',
    description: 'Отчет о монтажных работах: выполненные работы, материалы, сроки',
    icon: <HardHat className="w-8 h-8" />,
    category: 'Производство',
    color: 'from-teal-500 to-teal-600',
  },
  {
    id: 'warehouse-report',
    title: 'Отчет складлера',
    description: 'Отчет о складских операциях: приемка, списание, остатки',
    icon: <Truck className="w-8 h-8" />,
    category: 'Производство',
    color: 'from-emerald-500 to-emerald-600',
  },
];

const categories = [
  'Все отчеты',
  'Объекты иConstruction',
  'Финансы',
  'Производство',
];

interface ReportSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportSelectorModal({ isOpen, onClose }: ReportSelectorModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все отчеты');

  const filteredReports = selectedCategory === 'Все отчеты'
    ? reportOptions
    : reportOptions.filter(r => r.category === selectedCategory);

  const groupedByCategory = filteredReports.reduce<Record<string, ReportOption[]>>((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Выберите тип отчета</h2>
              <p className="text-blue-100">Создайте новый отчет, выбрав подходящую категорию</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#1976d2] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {Object.entries(groupedByCategory).map(([category, reports]) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1976d2]" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => alert(`Открываю форму: ${report.title}\n\nЗдесь будет открываться форма для создания отчета`)}
                    className="group text-left p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-[#1976d2] hover:shadow-lg transition-all duration-200"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {report.icon}
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-[#1976d2] transition-colors">
                      {report.title}
                    </h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {report.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
