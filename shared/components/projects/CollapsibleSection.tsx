'use client';

import { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon: string;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({ title, icon, collapsed, onToggle, children, className }: CollapsibleSectionProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200 ${className || ''}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {collapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-600 dark:text-slate-300" />
        )}
      </button>
      {!collapsed && <div className="p-5 pt-6">{children}</div>}
    </div>
  );
}
