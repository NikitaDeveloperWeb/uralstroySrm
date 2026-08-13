'use client';

import { Modal } from '@/shared/components/ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Создать отчет по объекту">
      <div className="space-y-4">
        <FormField label="Дата отчета">
          <input
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
          />
        </FormField>

        <FormField label="Период с">
          <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
        </FormField>

        <FormField label="Период по">
          <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" />
        </FormField>

        <FormField label="Комментарий">
          <textarea
            rows={4}
            placeholder="Введите комментарий к отчету..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
          />
        </FormField>

        <div className="flex gap-4 pt-4">
          <button className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors">
            Создать отчет
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold text-lg transition-colors"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
