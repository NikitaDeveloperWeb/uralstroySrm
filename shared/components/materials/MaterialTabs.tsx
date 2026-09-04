'use client';

import { CheckCircle, Clock } from 'lucide-react';

interface MaterialTabsProps {
  activeTab: 'in-stock' | 'ordered';
  onChange: (tab: 'in-stock' | 'ordered') => void;
  counts: { 'in-stock': number; 'ordered': number };
}

export function MaterialTabs({ activeTab, onChange, counts }: MaterialTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange('in-stock')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'in-stock'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        В наличии
        <span className="ml-1 bg-white dark:bg-slate-800/20 dark:bg-white dark:bg-slate-800/10 px-2 py-0.5 rounded-full text-xs">
          {counts['in-stock']}
        </span>
      </button>
      <button
        onClick={() => onChange('ordered')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'ordered'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600'
        }`}
      >
        <Clock className="w-4 h-4" />
        Под заказ
        <span className="ml-1 bg-white dark:bg-slate-800/20 dark:bg-white dark:bg-slate-800/10 px-2 py-0.5 rounded-full text-xs">
          {counts['ordered']}
        </span>
      </button>
    </div>
  );
}
