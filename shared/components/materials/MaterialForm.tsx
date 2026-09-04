'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { FormField } from '@/shared/components/ui/FormField';
import { Button } from '@/shared/components/ui/button';
import type { Material, CreateMaterialInput } from '@/shared/types/material';

interface Supplier {
  id: number;
  companyName: string;
  status: string;
}

interface UseSuppliersResult {
  suppliers: Supplier[];
  isLoading: boolean;
}

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaterialInput) => Promise<void>;
  editingMaterial?: Material | null;
}

const categories = [
  'Кирпич',
  'Цемент',
  'Дерево',
  'Металл',
  'Инструменты',
  'Кровля',
  'Утеплитель',
  'Отделка',
  'Электрика',
  'Сантехника',
  'Другое',
];

const units = ['шт', 'м²', 'м³', 'кг', 'тонна', 'комплект', 'м'];

const defaultData: CreateMaterialInput = {
  name: '',
  category: 'Кирпич',
  quantity: 0,
  unit: 'шт',
  price: 0,
  lotNumber: '',
  status: 'in-stock',
};

export const MaterialForm = memo(function MaterialForm({ isOpen, onClose, onSubmit, editingMaterial }: MaterialFormProps) {
  const [formData, setFormData] = useState<CreateMaterialInput>(defaultData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const prevIdRef = useRef<number | undefined>(editingMaterial?.id);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingSuppliers(true);
      fetch('/api/suppliers')
        .then((res) => res.json())
        .then((data) => {
          setSuppliers(data.filter((s: Supplier) => s.status === 'active'));
        })
        .catch(() => {})
        .finally(() => setIsLoadingSuppliers(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingMaterial && editingMaterial.id !== prevIdRef.current) {
      setFormData({
        name: editingMaterial.name,
        category: editingMaterial.category,
        quantity: editingMaterial.quantity,
        unit: editingMaterial.unit,
        price: editingMaterial.price || 0,
        lotNumber: editingMaterial.lotNumber || '',
        status: editingMaterial.status,
        location: editingMaterial.location || '',
        supplierId: editingMaterial.supplierId,
        orderDate: editingMaterial.orderDate || '',
        expectedDelivery: editingMaterial.expectedDelivery || '',
      });
    } else if (!editingMaterial && prevIdRef.current !== undefined) {
      setFormData({ ...defaultData });
    }
    setErrors({});
    prevIdRef.current = editingMaterial?.id;
  }, [editingMaterial]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Введите наименование';
    if (!formData.category) newErrors.category = 'Выберите категорию';
    if (formData.quantity < 0) newErrors.quantity = 'Количество не может быть отрицательным';
    if (!formData.unit) newErrors.unit = 'Выберите единицу измерения';

    if (formData.status === 'ordered' && !formData.supplierId) {
      newErrors.supplierId = 'Укажите поставщика';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
    setFormData({ ...defaultData });
    setErrors({});
    onClose();
  };

  const handleCancel = () => {
    setFormData({ ...defaultData });
    setErrors({});
    onClose();
  };

  const isEdit = !!editingMaterial;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div ref={formRef} className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white">{isEdit ? 'Редактировать материал' : 'Добавить материал'}</h2>
          <button onClick={handleCancel} className="text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <FormField label="Наименование" required error={errors.name}>
            <input
              autoFocus
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Категория" required error={errors.category}>
              <select
                value={formData.category}
                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Статус">
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as CreateMaterialInput['status'] }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                <option value="in-stock">В наличии</option>
                <option value="ordered">Под заказ</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Количество" required error={errors.quantity}>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </FormField>

            <FormField label="Ед. изм." required error={errors.unit}>
              <select
                value={formData.unit}
                onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Местоположение">
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Цена">
              <input
                type="number"
                value={formData.price ?? ''}
                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </FormField>

            <FormField label="Номер партии">
              <input
                type="text"
                value={formData.lotNumber || ''}
                onChange={(e) => setFormData((p) => ({ ...p, lotNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </FormField>
          </div>

          {formData.status === 'ordered' && (
            <div className="space-y-4 pt-2 border-t">
              <FormField label="Поставщик" required error={errors.supplierId}>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, supplierId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Выберите поставщика</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.companyName}</option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Дата заказа">
                  <input
                    type="date"
                    value={formData.orderDate || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, orderDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  />
                </FormField>

                <FormField label="Ожидаемая доставка">
                  <input
                    type="date"
                    value={formData.expectedDelivery || ''}
                    onChange={(e) => setFormData((p) => ({ ...p, expectedDelivery: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  />
                </FormField>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button onClick={handleCancel} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors">
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
