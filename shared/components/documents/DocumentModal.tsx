'use client';

import React, { useRef, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { CATEGORIES } from '@/shared/constants/documents';
import { useToast } from '@/shared/components/ui/Toast';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  document?: {
    id: string;
    name: string;
    description?: string | null;
    category: string;
    fileName: string;
  } | null;
}

export function DocumentModal({ isOpen, onClose, onSubmit, document }: DocumentModalProps) {
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!document;

  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!name) {
      toast('Введите название', 'error');
      return;
    }

    if (!isEdit) {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) {
        toast('Выберите файл', 'error');
        return;
      }
      formData.append('file', fileInput.files[0]);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch {
      toast('Ошибка при сохранении', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Редактировать документ' : 'Загрузить документ'}
    >
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">
            Название *
          </label>
          <input
            ref={nameRef}
            type="text"
            name="name"
            required
            defaultValue={document?.name || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Например: Типовой договор подряда"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">
            Описание
          </label>
          <textarea
            ref={descriptionRef}
            name="description"
            defaultValue={document?.description || ''}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Краткое описание документа"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">
            Категория *
          </label>
          <select
            ref={categoryRef}
            name="category"
            defaultValue={document?.category || 'contracts'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">
              Файл *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.webp"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">
              Макс. размер: 10 МБ. Форматы: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG
            </p>
          </div>
        )}

        {isEdit && document && (
          <div className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700 p-2 rounded">
            Файл: {document.fileName}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEdit ? 'Сохранить' : 'Добавить'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700"
          >
            Отмена
          </button>
        </div>
      </form>
    </Modal>
  );
}
