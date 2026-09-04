'use client';

import { Search } from 'lucide-react';

interface MaterialSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MaterialSearch({ value, onChange, placeholder = 'Поиск по наименованию, категории...' }: MaterialSearchProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-gray-400 dark:text-slate-500" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:bg-slate-700 dark:text-white"
      />
    </div>
  );
}
