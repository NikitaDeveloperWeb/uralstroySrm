'use client';

import { Modal } from '@/shared/components/ui/Modal';

interface Template {
  id: number;
  name: string;
  quantity?: string;
  cost: number;
  category?: string | null;
}

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templates: Template[];
  onSelect: (template: Template) => void;
}

export function TemplatePickerModal({ isOpen, onClose, title, templates, onSelect }: TemplatePickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-6xl">
      {templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Нет доступных шаблонов</div>
      ) : (
        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {templates.map(template => (
            <button
              key={template.id}
              onClick={() => { onSelect(template); onClose(); }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition-colors">
              <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
              <div className="text-sm text-gray-600">
                {template.quantity ? `${template.quantity} × ` : ''}{template.cost.toLocaleString('ru-RU')} ₽
              </div>
              {template.category && (
                <div className="text-xs text-gray-500 mt-1">{template.category}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
