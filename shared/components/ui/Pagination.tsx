'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 12 }: Props) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">
        {totalItems && itemsPerPage
          ? `Показано ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} из ${totalItems}`
          : `Страница ${currentPage} из ${totalPages}`}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300 dark:text-slate-300" />
        </button>
        
        {getPageNumbers().map((page, i) =>
          typeof page === 'string' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 dark:text-slate-500 dark:text-slate-500">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-[#1976d2] text-white'
                  : 'border border-gray-200 dark:border-slate-700 dark:border-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {page}
            </button>
          )
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-300 dark:text-slate-300" />
        </button>
      </div>
    </div>
  );
}
