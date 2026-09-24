'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCenter } from '@/shared/components/help/HelpCenter';
import { BookOpen, Home, Building2, Wallet, Users, Package, Truck, BarChart3, Settings, FileText, ChevronRight, ShoppingCart } from 'lucide-react';

export default function HelpPage() {
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const quickLinks = [
    {
      title: 'Начало работы',
      description: 'Знакомство с системой, вход, первая настройка',
      icon: <BookOpen className="w-6 h-6" />,
      section: 'getting-started',
      color: 'bg-blue-500',
    },
    {
      title: 'Управление проектами',
      description: 'Создание проектов, смет, отслеживание прогресса',
      icon: <Building2 className="w-6 h-6" />,
      section: 'projects',
      color: 'bg-purple-500',
    },
    {
      title: 'Финансы',
      description: 'Доходы, расходы, зарплаты, подотчеты, фонды',
      icon: <Wallet className="w-6 h-6" />,
      section: 'finance',
      color: 'bg-green-500',
    },
    {
      title: 'Сотрудники',
      description: 'Управление персоналом, бригады, навыки',
      icon: <Users className="w-6 h-6" />,
      section: 'employees',
      color: 'bg-indigo-500',
    },
    {
      title: 'Склад и материалы',
      description: 'Учет материалов, движение, поставщики',
      icon: <Package className="w-6 h-6" />,
      section: 'warehouse',
      color: 'bg-orange-500',
    },
    {
      title: 'Расчеты с поставщиками',
      description: 'Поступления материалов, платежи, выписки, баланс',
      icon: <ShoppingCart className="w-6 h-6" />,
      section: 'supplier-settlements',
      color: 'bg-red-500',
    },
    {
      title: 'Подрядчики',
      description: 'Управление подрядными организациями',
      icon: <Truck className="w-6 h-6" />,
      section: 'subcontractors',
      color: 'bg-teal-500',
    },
    {
      title: 'Отчеты и аналитика',
      description: 'Финансовые отчеты, ЕОТ, дашборд, KPI',
      icon: <BarChart3 className="w-6 h-6" />,
      section: 'reports',
      color: 'bg-pink-500',
    },
    {
      title: 'Настройки',
      description: 'Категории, шаблоны, бэкапы',
      icon: <Settings className="w-6 h-6" />,
      section: 'settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Справка</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Выберите раздел для просмотра инструкций или воспользуйтесь поиском
          </p>
        </div>
        <button
          onClick={() => setShowHelpCenter(true)}
          className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          Открыть полную справку
        </button>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {quickLinks.map((link, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-slate-700"
            onClick={() => setShowHelpCenter(true)}
          >
            <div className="flex items-start gap-4">
              <div className={`${link.color} p-3 rounded-lg text-white`}>
                {link.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {link.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                  {link.description}
                </p>
                <div className="flex items-center gap-1 text-[#1976d2] text-sm font-medium mt-3">
                  <span>Открыть инструкцию</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-8 border border-blue-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          🚀 Быстрый старт
        </h2>
        
        <div className="space-y-4">
          {[
            { step: 1, text: 'Добавьте клиентов в раздел "Клиенты"' },
            { step: 2, text: 'Создайте проект и привяжите клиента' },
            { step: 3, text: 'Заполните смету (материалы, работы, накладные)' },
            { step: 4, text: 'Добавьте сотрудников и создайте бригаду' },
            { step: 5, text: 'Начните учитывать доходы и расходы' },
            { step: 6, text: 'Формируйте ЕОТ и зарплатные отчеты' },
            { step: 7, text: 'Отслеживайте финансы на дашборде' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className="bg-[#1976d2] text-white font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                {item.step}
              </div>
              <p className="text-gray-800 dark:text-slate-200 font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="bg-yellow-50 dark:bg-slate-800 rounded-lg p-8 border border-yellow-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          💡 Полезные советы
        </h2>
        <div className="space-y-3">
          {[
            'Используйте шаблоны смет для ускорения создания новых проектов',
            'Экспортируйте отчеты в Excel для детального анализа',
            'Настройте категории расходов для удобной фильтрации',
            'Привязывайте расходы к проектам для точного учета',
            'Регулярно делайте резервные копии базы данных',
            'Используйте поиск в справке (Ctrl+F) для быстрого нахождения ответов',
          ].map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-yellow-600 mt-1">•</span>
              <p className="text-gray-800 dark:text-slate-200">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-md border border-gray-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⌨️ Горячие клавиши
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'Ctrl + F', action: 'Поиск по справке' },
            { key: 'Esc', action: 'Закрыть модальное окно' },
          ].map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <span className="text-gray-800 dark:text-slate-200">{shortcut.action}</span>
              <kbd className="px-3 py-1 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded text-sm font-mono text-gray-700 dark:text-slate-200">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Help Center Modal */}
      <HelpCenter isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
    </div>
  );
}
