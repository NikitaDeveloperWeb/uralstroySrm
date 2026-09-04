'use client';

import { AlertTriangle, Info, X } from 'lucide-react';

interface CustomAlertProps {
  isOpen: boolean;
  message: string;
  type: 'alert' | 'confirm';
  title: string;
  okText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CustomAlert({
  isOpen,
  message,
  type,
  title,
  okText,
  cancelText,
  onConfirm,
  onCancel,
}: CustomAlertProps) {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {type === 'confirm' ? (
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            ) : (
              <Info className="w-6 h-6 text-blue-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          {isConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#1976d2] hover:bg-[#1565c0] text-white rounded-lg transition-colors font-medium"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
}
