'use client';

import { useState } from 'react';

interface Brigade {
  id: number;
  name: string;
}

interface AddObjectFormProps {
  onSubmit: (data: {
    name: string;
    area: string;
    address: string;
    type: string;
    cost: string;
    date: string;
    complexity: string;
    prepayment?: string;
    prepaymentDate?: string;
    brigadeId?: string;
  }) => void;
  brigades: Brigade[];
}

export function AddObjectForm({ onSubmit, brigades }: AddObjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    address: '',
    type: '',
    cost: '',
    date: '',
    complexity: 'легкий',
    prepayment: '',
    prepaymentDate: '',
    brigadeId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleComplexityChange = (value: string) => {
    setFormData({ ...formData, complexity: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      area: '',
      address: '',
      type: '',
      cost: '',
      date: '',
      complexity: 'легкий',
      prepayment: '',
      prepaymentDate: '',
      brigadeId: '',
    });
  };

  const inputClasses = 'w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]';

  const today = new Date();
  const dateStr = today.getDate().toString().padStart(2, '0') +
    (today.getMonth() + 1).toString().padStart(2, '0') +
    today.getFullYear().toString() +
    '01';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Код объекта</label>
        <input
          type="text"
          value={dateStr}
          readOnly
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Название объекта"
          className={inputClasses}
          required
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
        <input
          type="number"
          name="area"
          value={formData.area}
          onChange={handleChange}
          placeholder="Площадь (м²)"
          className={inputClasses}
          required
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Адрес"
          className={inputClasses}
          required
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className={inputClasses}
          required
        >
          <option value="">Выберите тип</option>
          <option value="дом">Дом</option>
          <option value="баня">Баня</option>
          <option value="туалет">Туалет</option>
          <option value="хозблок">Хозблок</option>
          <option value="веранда">Веранда</option>
        </select>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <input
          type="number"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          placeholder="Стоимость"
          className={inputClasses}
          required
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Сложность</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="complexity"
              value="легкий"
              checked={formData.complexity === 'легкий'}
              onChange={() => handleComplexityChange('легкий')}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700">Легкий</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="complexity"
              value="средний"
              checked={formData.complexity === 'средний'}
              onChange={() => handleComplexityChange('средний')}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700">Средний</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="complexity"
              value="сложный"
              checked={formData.complexity === 'сложный'}
              onChange={() => handleComplexityChange('сложный')}
              className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
            />
            <span className="text-gray-700">Сложный</span>
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Бригада</label>
        <select
          name="brigadeId"
          value={formData.brigadeId}
          onChange={handleChange}
          className={inputClasses}
        >
          <option value="">Без бригады</option>
          {brigades.map(brigade => (
            <option key={brigade.id} value={brigade.id}>{brigade.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Сумма предоплаты</label>
          <input
            type="number"
            name="prepayment"
            value={formData.prepayment}
            onChange={handleChange}
            placeholder="0"
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Дата предоплаты</label>
          <input
            type="date"
            name="prepaymentDate"
            value={formData.prepaymentDate}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="submit" className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-2 px-4 rounded-lg font-semibold text-lg transition-colors">
          Добавить объект
        </button>
      </div>
    </form>
  );
}
