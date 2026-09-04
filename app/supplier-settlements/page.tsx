'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronUp, X, Plus } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';

interface SupplierBalance {
  supplierId: number;
  companyName: string;
  category: string;
  totalReceived: number;
  totalPaid: number;
  balance: number;
}

interface Movement {
  id: number;
  amount: number | null;
  date: string;
  comment: string | null;
  item: { name: string; quantity: number; unit: string };
}

interface Payment {
  id: number;
  amount: number;
  date: string;
  purpose: string;
  recipient: string;
}

interface SupplierDetail {
  supplier: {
    id: number;
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string | null;
    address: string;
    category: string;
  };
  summary: {
    totalReceived: number;
    totalPaid: number;
    balance: number;
  };
  movements: Movement[];
  payments: Payment[];
}

export default function SupplierSettlementsPage() {
  const [suppliers, setSuppliers] = useState<SupplierBalance[]>([]);
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'debt' | 'credit'>('all');
  const [loading, setLoading] = useState(true);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const matNameRef = useRef<HTMLInputElement>(null);
  const matCategoryRef = useRef<HTMLInputElement>(null);
  const matQuantityRef = useRef<HTMLInputElement>(null);
  const matUnitRef = useRef<HTMLSelectElement>(null);
  const matPriceRef = useRef<HTMLInputElement>(null);
  const matAmountRef = useRef<HTMLInputElement>(null);
  const matDateRef = useRef<HTMLInputElement>(null);
  const matCommentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/supplier-settlements');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/supplier-settlements?supplierId=${id}`);
      const data = await res.json();
      if (data.success) {
        setDetail(data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch supplier detail:', err);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    if (filter === 'debt') return s.balance > 0;
    if (filter === 'credit') return s.balance < 0;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleAddMaterial = async () => {
    try {
      const name = matNameRef.current?.value?.trim();
      const category = matCategoryRef.current?.value?.trim();
      const quantity = matQuantityRef.current?.value;
      const amount = matAmountRef.current?.value;

      if (!name || !category || !quantity || !amount) {
        alert('Заполните обязательные поля: название, категория, количество и сумма');
        return;
      }

      const body = {
        supplierId: detail.supplier.id,
        name,
        category,
        quantity,
        unit: matUnitRef.current?.value || 'шт',
        price: matPriceRef.current?.value || null,
        amount,
        date: matDateRef.current?.value || new Date().toISOString().split('T')[0],
        comment: matCommentRef.current?.value?.trim() || null,
      };

      console.log('Sending:', body);

      const res = await fetch('/api/supplier-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('API Error:', err);
        alert(err.message || 'Ошибка при добавлении материала');
        return;
      }

      setIsMaterialModalOpen(false);
      if (matNameRef.current) matNameRef.current.value = '';
      if (matCategoryRef.current) matCategoryRef.current.value = '';
      if (matQuantityRef.current) matQuantityRef.current.value = '';
      if (matPriceRef.current) matPriceRef.current.value = '';
      if (matAmountRef.current) matAmountRef.current.value = '';
      if (matCommentRef.current) matCommentRef.current.value = '';
      if (matDateRef.current) matDateRef.current.value = new Date().toISOString().split('T')[0];
      fetchSupplierDetail(detail.supplier.id);
    } catch (err) {
      console.error('Failed to add material:', err);
      alert('Ошибка при добавлении материала');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Расчёты с поставщиками</h1>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}>
          Все
        </button>
        <button
          onClick={() => setFilter('debt')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'debt'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}>
          Долг перед поставщиком
        </button>
        <button
          onClick={() => setFilter('credit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'credit'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}>
          Переплата (нам должны)
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-[#1976d2]">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Всего поставщиков</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{suppliers.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Общий долг перед поставщиками</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(suppliers.filter(s => s.balance > 0).reduce((sum, s) => sum + s.balance, 0))} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Общая переплата</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(Math.abs(suppliers.filter(s => s.balance < 0).reduce((sum, s) => sum + s.balance, 0)))} ₽
          </p>
        </div>
      </div>

      {/* Таблица поставщиков */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Поставщик
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Категория
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Забрано материалов
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Оплачено
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Баланс
                </th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr
                  key={supplier.supplierId}
                  className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">
                    {supplier.companyName}
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-slate-300">
                    {supplier.category}
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-slate-300 text-right">
                    {formatCurrency(supplier.totalReceived)} ₽
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-slate-300 text-right">
                    {formatCurrency(supplier.totalPaid)} ₽
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`font-semibold ${
                        supplier.balance > 0
                          ? 'text-red-600'
                          : supplier.balance < 0
                            ? 'text-green-600'
                            : 'text-gray-600 dark:text-slate-300'
                      }`}>
                      {supplier.balance > 0 ? '+' : ''}{formatCurrency(supplier.balance)} ₽
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => fetchSupplierDetail(supplier.supplierId)}
                      className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
                      Детали
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-slate-400 text-lg">Поставщики не найдены</p>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDetail(null);
        }}
        title={detail?.supplier.companyName || 'Детали'}>
        {detail && (
          <div className="space-y-6">
            <button
              onClick={() => setIsMaterialModalOpen(true)}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors w-full justify-center">
              <Plus className="w-4 h-4" />
              Добавить материал от этого поставщика
            </button>
            {/* Контактная информация */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Контакты</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Контактное лицо:</span> {detail.supplier.contactPerson}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Телефон:</span> {detail.supplier.phone}
              </p>
              {detail.supplier.email && (
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  <span className="font-medium">Email:</span> {detail.supplier.email}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-slate-300">
                <span className="font-medium">Адрес:</span> {detail.supplier.address}
              </p>
            </div>

            {/* Сводка */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Забрано</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(detail.summary.totalReceived)} ₽
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Оплачено</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(detail.summary.totalPaid)} ₽
                </p>
              </div>
              <div className={`rounded-lg p-4 ${
                detail.summary.balance > 0
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : detail.summary.balance < 0
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-gray-50 dark:bg-slate-700'
              }`}>
                <p className={`text-xs mb-1 ${
                  detail.summary.balance > 0
                    ? 'text-red-600 dark:text-red-400'
                    : detail.summary.balance < 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-slate-300'
                }`}>
                  Баланс
                </p>
                <p className={`text-lg font-bold ${
                  detail.summary.balance > 0
                    ? 'text-red-700 dark:text-red-300'
                    : detail.summary.balance < 0
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-700 dark:text-slate-300'
                }`}>
                  {detail.summary.balance > 0 ? 'Мы должны' : detail.summary.balance < 0 ? 'Нам должны' : '0'} {formatCurrency(Math.abs(detail.summary.balance))} ₽
                </p>
              </div>
            </div>

            {/* Приходы */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-green-600" />
                Приход материалов ({detail.movements.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detail.movements.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {m.item?.name || '—'} — {m.item?.quantity || 0} {m.item?.unit || '—'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{formatDate(m.date)}</p>
                      {m.comment && <p className="text-xs text-gray-500 dark:text-slate-400">{m.comment}</p>}
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      +{m.amount ? formatCurrency(m.amount) : '—'} ₽
                    </span>
                  </div>
                ))}
                {detail.movements.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">Нет записей</p>
                )}
              </div>
            </div>

            {/* Оплата */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4 text-red-600" />
                Оплата ({detail.payments.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detail.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.purpose}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {formatDate(p.date)} — {p.recipient}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      -{formatCurrency(p.amount)} ₽
                    </span>
                  </div>
                ))}
                {detail.payments.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">Нет записей</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Модальное окно добавления материала */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
        }}
        title={detail ? `Добавить материал — ${detail.supplier.companyName}` : 'Добавить материал'}>
        {detail && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddMaterial();
            }}
            className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Название *</label>
                <input
                  ref={matNameRef}
                  autoFocus
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  placeholder="Цемент М500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Категория *</label>
                <input
                  ref={matCategoryRef}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  placeholder="Стройматериалы"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Количество *</label>
                <input
                  ref={matQuantityRef}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Ед. изм.</label>
                <select
                  ref={matUnitRef}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white">
                  <option value="шт">шт</option>
                  <option value="м²">м²</option>
                  <option value="м³">м³</option>
                  <option value="кг">кг</option>
                  <option value="тонна">тонна</option>
                  <option value="м">м</option>
                  <option value="комплект">комплект</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Цена за ед.</label>
                <input
                  ref={matPriceRef}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Общая сумма * (₽)</label>
                <input
                  ref={matAmountRef}
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Дата</label>
                <input
                  ref={matDateRef}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Комментарий</label>
              <input
                ref={matCommentRef}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
                placeholder="Необязательно"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                Добавить
              </button>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors">
                Отмена
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
