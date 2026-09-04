'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
import { SkillType } from '@/app/employees/page';
import { useAlert } from '@/shared/hooks/useAlert';

interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
  skills: SkillType[];
}

interface Employee {
  id: number;
  fullName: string;
  workplace: 'цех' | 'монтаж';
}

interface BrigadeFormProps {
  editingBrigade: Brigade | null;
  employees: Employee[];
  workplaceColors: Record<string, string>;
  skills: { id: number; name: string }[];
  onSave: (data: { name: string; leaderId: number; memberIds: number[]; skills: SkillType[] }) => void;
  onCancel: () => void;
}

const skillColors: Record<string, string> = {
  'сварщик': 'bg-yellow-100 text-yellow-800',
  'каменщик': 'bg-amber-100 text-amber-800',
  'плотник': 'bg-orange-100 text-orange-800',
  'монтажник': 'bg-purple-100 text-purple-800',
  'электрик': 'bg-cyan-100 text-cyan-800',
  'сантехник': 'bg-blue-100 text-blue-800',
  'маляр': 'bg-pink-100 text-pink-800',
  'штукатур': 'bg-lime-100 text-lime-800',
  'крановщик': 'bg-red-100 text-red-800',
  'бетонщик': 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200',
  'гибочик металла': 'bg-indigo-100 text-indigo-800',
  'строитель-универсал': 'bg-teal-100 text-teal-800',
};

export const BrigadeForm = memo(function BrigadeForm({
  editingBrigade,
  employees,
  workplaceColors,
  skills,
  onSave,
  onCancel,
}: BrigadeFormProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [brigadeSkills, setBrigadeSkills] = useState<SkillType[]>([]);

  useEffect(() => {
    if (editingBrigade) {
      if (nameRef.current) {
        nameRef.current.value = editingBrigade.name;
      }
      if (selectRef.current) {
        selectRef.current.value = String(editingBrigade.leaderId);
      }
      setMemberIds(editingBrigade.memberIds || []);
      setBrigadeSkills(editingBrigade.skills || []);
    } else {
      if (nameRef.current) {
        nameRef.current.value = '';
      }
      if (selectRef.current) {
        selectRef.current.value = '0';
      }
      setMemberIds([]);
      setBrigadeSkills([]);
    }
  }, [editingBrigade]);

  const toggleSkill = (skill: SkillType) => {
    setBrigadeSkills(prev => 
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleMember = (empId: number, checked: boolean) => {
    setMemberIds(prev => 
      checked
        ? [...prev, empId]
        : prev.filter(id => id !== empId)
    );
  };

  const { alert } = useAlert();

  const handleSave = () => {
    const name = nameRef.current?.value || '';
    const leaderId = selectRef.current ? parseInt(selectRef.current.value, 10) : 0;
    
    if (!name || !leaderId) {
      alert('Заполните название и выберите прораба');
      return;
    }

    onSave({ name, leaderId, memberIds, skills: brigadeSkills });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название</label>
        <input
          ref={nameRef}
          type="text"
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
          placeholder="Например: Бригада «Строй»"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Прораб</label>
        <select
          ref={selectRef}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
        >
          <option value={0}>Выберите прораба</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.fullName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Участники</label>
        <div className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
          {employees.filter(e => editingBrigade ? e.id !== editingBrigade.leaderId : true).map(emp => {
            const leaderId = editingBrigade ? editingBrigade.leaderId : (selectRef.current ? parseInt(selectRef.current.value, 10) : 0);
            const isChecked = memberIds.includes(emp.id) && emp.id !== leaderId;
            return (
              <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={e => toggleMember(emp.id, e.target.checked)}
                  className="rounded border-gray-300 dark:border-slate-600 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {emp.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 dark:text-slate-300">{emp.fullName}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${workplaceColors[emp.workplace]}`}>
                  {emp.workplace}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-2">Навыки бригады</label>
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => {
            const selected = brigadeSkills.includes(skill.name);
            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggleSkill(skill.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selected
                    ? 'bg-[#1976d2] text-white'
                    : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-700 dark:border-slate-600'
                }`}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
});
