'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pencil, Trash2, Search, Plus, Users, ChevronDown, ChevronUp, DollarSign, BadgeCheck, FileText } from 'lucide-react';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Modal } from '@/shared/components/ui/Modal';
import { useEmployeeStore } from '@/shared/stores/employeeStore';
import { BrigadeForm } from '@/shared/components/employees/BrigadeForm';
import * as XLSX from 'xlsx';

export type SkillType = string;

interface Employee {
  id: number;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  hireDate: string;
  workplace: 'цех' | 'монтаж';
  paymentType: 'сменная' | 'сдельная';
  employmentType: 'штат' | 'подработка';
  skills: SkillType[];
}

const initialEmployees: Employee[] = [
  { id: 1, fullName: 'Иванов Иван Иванович', birthDate: '1985-03-15', phone: '+7 (900) 123-45-67', address: 'г. Москва, ул. Ленина, д. 10, кв. 5', hireDate: '2020-01-10', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['сварщик', 'каменщик'] },
  { id: 2, fullName: 'Петров Петр Сергеевич', birthDate: '1990-07-22', phone: '+7 (900) 234-56-78', address: 'г. Москва, ул. Мира, д. 25, кв. 12', hireDate: '2019-05-20', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['монтажник', 'электрик', 'сварщик'] },
  { id: 3, fullName: 'Сидоров Алексей Дмитриевич', birthDate: '1988-11-05', phone: '+7 (900) 345-67-89', address: 'г. Москва, ул. Садовая, д. 8, кв. 3', hireDate: '2021-03-15', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['плотник', 'крановщик'] },
  { id: 4, fullName: 'Козлов Дмитрий Николаевич', birthDate: '1992-02-18', phone: '+7 (900) 456-78-90', address: 'г. Москва, ул. Центральная, д. 15, кв. 20', hireDate: '2022-07-01', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'подработка', skills: ['монтажник', 'маляр'] },
  { id: 5, fullName: 'Морозова Анна Владимировна', birthDate: '1995-09-30', phone: '+7 (900) 567-89-01', address: 'г. Москва, ул. Полевая, д. 3, кв. 8', hireDate: '2023-01-20', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['штукатур', 'маляр'] },
  { id: 6, fullName: 'Новиков Сергей Андреевич', birthDate: '1987-06-12', phone: '+7 (900) 678-90-12', address: 'г. Москва, ул. Заводская, д. 22, кв. 15', hireDate: '2018-11-05', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['сантехник', 'электрик', 'сварщик'] },
  { id: 7, fullName: 'Волкова Елена Игоревна', birthDate: '1993-12-25', phone: '+7 (900) 789-01-23', address: 'г. Москва, ул. Строителей, д. 5, кв. 30', hireDate: '2021-09-10', workplace: 'цех', paymentType: 'сменная', employmentType: 'подработка', skills: ['бетонщик', 'строитель-универсал'] },
  { id: 8, fullName: 'Соколов Максим Павлович', birthDate: '1991-04-08', phone: '+7 (900) 890-12-34', address: 'г. Москва, ул. Промышленная, д. 11, кв. 7', hireDate: '2020-06-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['каменщик', 'монтажник'] },
  { id: 9, fullName: 'Кузнецов Андрей Владимирович', birthDate: '1986-08-20', phone: '+7 (900) 901-23-45', address: 'г. Москва, ул. Строителей, д. 18, кв. 42', hireDate: '2017-04-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['кровельщик', 'сварщик', 'монтажник'] },
  { id: 10, fullName: 'Попова Ольга Сергеевна', birthDate: '1994-03-10', phone: '+7 (901) 112-23-34', address: 'г. Москва, ул. Строителей, д. 20, кв. 8', hireDate: '2021-06-01', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['маляр', 'штукатур'] },
  { id: 11, fullName: 'Васильев Дмитрий Николаевич', birthDate: '1989-11-25', phone: '+7 (901) 223-34-45', address: 'г. Москва, ул. Строителей, д. 22, кв. 15', hireDate: '2020-09-10', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['плотник', 'крановщик'] },
  { id: 12, fullName: 'Зайцева Мария Александровна', birthDate: '1992-06-18', phone: '+7 (901) 334-45-56', address: 'г. Москва, ул. Строителей, д. 24, кв. 22', hireDate: '2022-02-20', workplace: 'цех', paymentType: 'сменная', employmentType: 'штат', skills: ['маляр', 'штукатур', 'строитель-универсал'] },
  { id: 13, fullName: 'Орлов Павел Дмитриевич', birthDate: '1984-01-05', phone: '+7 (901) 445-56-67', address: 'г. Москва, ул. Строителей, д. 26, кв. 30', hireDate: '2016-08-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['каменщик', 'бетонщик'] },
  { id: 14, fullName: 'Новикова Елена Павловна', birthDate: '1996-09-12', phone: '+7 (901) 556-67-78', address: 'г. Москва, ул. Строителей, д. 28, кв. 5', hireDate: '2023-03-01', workplace: 'цех', paymentType: 'сменная', employmentType: 'подработка', skills: ['электрик', 'сантехник'] },
  { id: 15, fullName: 'Федоров Алексей Игоревич', birthDate: '1987-12-30', phone: '+7 (901) 667-78-89', address: 'г. Москва, ул. Строителей, д. 30, кв. 12', hireDate: '2019-11-15', workplace: 'монтаж', paymentType: 'сдельная', employmentType: 'штат', skills: ['сварщик', 'кровельщик'] },
];

export interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
  skills: SkillType[];
}

const initialBrigades: Brigade[] = [
  { id: 1, name: 'Бригада «Строй»', leaderId: 1, memberIds: [2, 4], skills: ['сварщик', 'монтажник', 'каменщик'] },
  { id: 2, name: 'Бригада «Монтаж»', leaderId: 6, memberIds: [3, 5], skills: ['плотник', 'бетонщик', 'штукатур'] },
  { id: 3, name: 'Бригада «Универсал»', leaderId: 7, memberIds: [8, 14], skills: ['строитель-универсал', 'сантехник', 'электрик'] },
  { id: 4, name: 'Бригада «Кровля»', leaderId: 9, memberIds: [10, 11], skills: ['кровельщик', 'сварщик', 'монтажник'] },
  { id: 5, name: 'Бригада «Фасад»', leaderId: 12, memberIds: [13, 15], skills: ['маляр', 'штукатур', 'каменщик'] },
];

const workplaceColors: Record<string, string> = {
  цех: 'bg-blue-100 text-blue-800',
  монтаж: 'bg-purple-100 text-purple-800',
};

const paymentTypeColors: Record<string, string> = {
  'сменная': 'bg-green-100 text-green-800',
  'сдельная': 'bg-orange-100 text-orange-800',
};

const employmentTypeColors: Record<string, string> = {
  'штат': 'bg-indigo-100 text-indigo-800',
  'подработка': 'bg-teal-100 text-teal-800',
};

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
  'бетонщик': 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200',
  'гибочик металла': 'bg-indigo-100 text-indigo-800',
  'строитель-универсал': 'bg-teal-100 text-teal-800',
};

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'brigades' | 'skills'>('employees');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [formDataHourlyRateId, setFormDataHourlyRateId] = useState<number | null>(null);
  const formRefs = useRef({
    fullName: null as HTMLInputElement | null,
    birthDate: null as HTMLInputElement | null,
    hireDate: null as HTMLInputElement | null,
    phone: null as HTMLInputElement | null,
    address: null as HTMLInputElement | null,
    workplace: null as HTMLSelectElement | null,
    paymentType: null as HTMLSelectElement | null,
    employmentType: null as HTMLSelectElement | null,
    hourlyRateId: null as HTMLSelectElement | null,
  });
  const rateSearchRef = useRef<HTMLInputElement | null>(null);
  const ratePositionRef = useRef<HTMLInputElement | null>(null);
  const rateValueRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const itemsPerPage = 12;

  // Hourly Rates modal state
  const [isHourlyRateModalOpen, setIsHourlyRateModalOpen] = useState(false);
  const [isRateFormOpen, setIsRateFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<{ id: number; position: string; rate: number } | null>(null);

  // Brigades state
  const [isBrigadeModalOpen, setIsBrigadeModalOpen] = useState(false);
  const [editingBrigade, setEditingBrigade] = useState<Brigade | null>(null);
  const [brigadeFormData, setBrigadeFormData] = useState<Partial<Brigade>>({});
  const [brigadeSearch, setBrigadeSearch] = useState('');

  // Skills state (moved from /skills page)
  const [skillsSearchQuery, setSkillsSearchQuery] = useState('');
  const [skillsCurrentPage, setSkillsCurrentPage] = useState(1);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ id: number; name: string; description: string | null } | null>(null);
  const skillNameRef = useRef<HTMLInputElement>(null);
  const skillDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const itemsPerPageSkills = 12;

  // Zustand store
  const {
    employees: storeEmployees,
    brigades: storeBrigades,
    loading,
    error,
    fetchEmployees,
    fetchBrigades,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    createBrigade,
    updateBrigade,
    deleteBrigade,
  } = useEmployeeStore();

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchEmployees();
    fetchBrigades();
  }, [fetchEmployees, fetchBrigades]);

  // Загрузка ставок
  const [hourlyRates, setHourlyRates] = useState<{ id: number; position: string; rate: number }[]>([]);
  // Загрузка навыков для маппинга
  const [skillMap, setSkillMap] = useState<Record<string, number>>({});
  // Загрузка навыков для отображения
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    fetch('/api/skills')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const map: Record<string, number> = {};
          for (const s of data.data) { map[s.name] = s.id; }
          setSkillMap(map);
          setSkills(data.data);
        }
      })
      .catch(err => console.error('Ошибка загрузки навыков:', err));
  }, []);
  useEffect(() => {
    fetch('/api/hourly-rates')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setHourlyRates(data.data as { id: number; position: string; rate: number }[]);
        }
      })
      .catch(err => console.error('Ошибка загрузки ставок:', err));
  }, []);

  // Преобразование данных из API (relation skills в массивы имен)
  const employees = storeEmployees.map(emp => ({
    ...emp,
    fullName: emp.fullName,
    birthDate: emp.birthDate,
    phone: emp.phone,
    address: emp.address,
    hireDate: emp.hireDate,
    workplace: emp.workplace as 'цех' | 'монтаж',
    paymentType: emp.paymentType as 'сменная' | 'сдельная',
    employmentType: emp.employmentType as 'штат' | 'подработка',
    skills: (emp.skills as any[] | undefined) ? (emp.skills as any[]).map((s: any) => s.name || s) as SkillType[] : [],
    brigadeId: emp.brigadeId,
  })) as Employee[];

  const brigades = storeBrigades.map(b => ({
    ...b,
    skills: (b.skills as any[] | undefined) ? (b.skills as any[]).map((s: any) => s.name || s) as SkillType[] : [],
    memberIds: b.memberIds ? b.memberIds.split(',').filter(Boolean).map(Number) : [],
  }));

  const filteredEmployees = employees
    .filter(emp =>
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Сначала цех, потом монтаж
      if (a.workplace !== b.workplace) {
        return a.workplace === 'цех' ? -1 : 1;
      }
      // Внутри группы — по алфавиту
      return a.fullName.localeCompare(b.fullName, 'ru');
    });

  const filteredBrigades = brigades.filter(b =>
    b.name.toLowerCase().includes(brigadeSearch.toLowerCase()) ||
    b.skills.some(s => s.toLowerCase().includes(brigadeSearch.toLowerCase()))
  );

  const empTotalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const brigTotalPages = Math.ceil(filteredBrigades.length / itemsPerPage);
  const paginatedBrigades = filteredBrigades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, brigadeSearch]);

  const getEmployeeById = (id: number) => employees.find(e => e.id === id);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сотрудника?')) return;
    try {
      await deleteEmployee(id);
    } catch (e: any) {
      alert(e.message || 'Ошибка удаления сотрудника');
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({ workplace: 'цех', paymentType: 'сменная', employmentType: 'штат' });
    setFormDataHourlyRateId(null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (formRefs.current.workplace) formRefs.current.workplace.value = 'цех';
      if (formRefs.current.paymentType) formRefs.current.paymentType.value = 'сменная';
      if (formRefs.current.employmentType) formRefs.current.employmentType.value = 'штат';
      if (formRefs.current.hourlyRateId) formRefs.current.hourlyRateId.value = '';
    }, 0);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      workplace: emp.workplace as 'цех' | 'монтаж',
      paymentType: emp.paymentType as 'сменная' | 'сдельная',
      employmentType: emp.employmentType as 'штат' | 'подработка',
    });
    setFormDataHourlyRateId(emp.id ? (emp as any).hourlyRateId || null : null);
    setIsModalOpen(true);
    setTimeout(() => {
      if (formRefs.current.fullName) formRefs.current.fullName.value = emp.fullName;
      if (formRefs.current.birthDate) formRefs.current.birthDate.value = emp.birthDate;
      if (formRefs.current.hireDate) formRefs.current.hireDate.value = emp.hireDate;
      if (formRefs.current.phone) formRefs.current.phone.value = emp.phone;
      if (formRefs.current.address) formRefs.current.address.value = emp.address;
      if (formRefs.current.workplace) formRefs.current.workplace.value = emp.workplace;
      if (formRefs.current.paymentType) formRefs.current.paymentType.value = emp.paymentType;
      if (formRefs.current.employmentType) formRefs.current.employmentType.value = emp.employmentType;
      if (formRefs.current.hourlyRateId) formRefs.current.hourlyRateId.value = (emp as any).hourlyRateId || '';
    }, 0);
  };

  const handleSave = async () => {
    try {
      const employeeData: any = {
        fullName: formRefs.current.fullName?.value?.trim(),
        birthDate: formRefs.current.birthDate?.value,
        phone: formRefs.current.phone?.value?.trim(),
        address: formRefs.current.address?.value?.trim(),
        hireDate: formRefs.current.hireDate?.value,
        workplace: formRefs.current.workplace?.value,
        paymentType: formRefs.current.paymentType?.value,
        employmentType: formRefs.current.employmentType?.value,
        skillIds: ((formData.skills || []) as SkillType[]).map(s => skillMap[s]).filter(Boolean),
      };

      if (!employeeData.fullName) {
        alert('Укажите ФИО');
        return;
      }

      const rateId = formRefs.current.hourlyRateId?.value;
      if (rateId) {
        employeeData.hourlyRateId = Number(rateId);
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, employeeData);
      } else {
        await createEmployee(employeeData);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({});
      setFormDataHourlyRateId(null);
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения сотрудника');
    }
  };

  // Brigades handlers
  const openBrigadeModal = useCallback((brigade?: Brigade) => {
    if (brigade) {
      setEditingBrigade(brigade);
      setBrigadeFormData({ ...brigade });
    } else {
      setEditingBrigade(null);
      setBrigadeFormData({ skills: [] });
    }
    setIsBrigadeModalOpen(true);
  }, []);

  const handleSaveBrigadeInternal = async (data: { name: string; leaderId: number; memberIds: number[]; skills: SkillType[] }) => {
    try {
      const brigadeData = {
        name: data.name,
        leaderId: data.leaderId,
        memberIds: data.memberIds.join(','),
        skillIds: data.skills.map(s => skillMap[s]).filter(Boolean),
      };

      if (editingBrigade) {
        await updateBrigade(editingBrigade.id, brigadeData);
      } else {
        await createBrigade(brigadeData);
      }
      setIsBrigadeModalOpen(false);
      setEditingBrigade(null);
    } catch (e: any) {
      alert(e.message || 'Ошибка сохранения бригады');
    }
  };

  const handleDeleteBrigade = async (id: number) => {
    if (confirm('Удалить эту бригаду?')) {
      try {
        await deleteBrigade(id);
      } catch (e: any) {
        alert(e.message || 'Ошибка удаления бригады');
      }
    }
  };

  const toggleSkill = (skill: SkillType, currentSkills: SkillType[]): SkillType[] => {
    return currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
  };

  // Skills handlers
  const filteredSkills = (skills as any[])
    .filter(s =>
      s.name.toLowerCase().includes(skillsSearchQuery.toLowerCase()) ||
      (s.description || '').toLowerCase().includes(skillsSearchQuery.toLowerCase())
    );

  const skillsTotalPages = Math.ceil(filteredSkills.length / itemsPerPageSkills);
  const paginatedSkills = filteredSkills.slice(
    (skillsCurrentPage - 1) * itemsPerPageSkills,
    skillsCurrentPage * itemsPerPageSkills
  );

  useEffect(() => {
    setSkillsCurrentPage(1);
  }, [skillsSearchQuery]);

  const handleDeleteSkill = async (id: number) => {
    if (!(await confirm('Удалить этот навык?'))) return;
    try {
      await fetch(`/api/skills/${id}`, { method: 'DELETE' });
      setSkills(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleAddSkill = () => {
    setEditingSkill(null);
    setIsSkillModalOpen(true);
    setTimeout(() => {
      if (skillNameRef.current) skillNameRef.current.value = '';
      if (skillDescriptionRef.current) skillDescriptionRef.current.value = '';
    }, 0);
  };

  const handleEditSkill = (skill: { id: number; name: string; description: string | null }) => {
    setEditingSkill(skill);
    setIsSkillModalOpen(true);
    setTimeout(() => {
      if (skillNameRef.current) skillNameRef.current.value = skill.name;
      if (skillDescriptionRef.current) skillDescriptionRef.current.value = skill.description || '';
    }, 0);
  };

  const handleSaveSkill = async () => {
    try {
      const name = skillNameRef.current?.value?.trim() || '';
      const description = skillDescriptionRef.current?.value?.trim() || '';

      if (!name) {
        alert('Укажите название');
        return;
      }

      if (editingSkill) {
        await fetch(`/api/skills/${editingSkill.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        setSkills(prev => prev.map(s =>
          s.id === editingSkill.id ? { ...s, name, description } : s
        ));
      } else {
        const res = await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description }),
        });
        const newSkill = await res.json();
        setSkills(prev => [...prev, newSkill.data]);
      }
      setIsSkillModalOpen(false);
      setEditingSkill(null);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const getHourlyRatePosition = (emp: Employee): string => {
    const rateId = (emp as any).hourlyRateId;
    if (!rateId) return '—';
    const rate = hourlyRates.find(r => r.id === rateId);
    return rate ? `${rate.position} (${rate.rate} ₽/ч)` : '—';
  };

  const getHourlyRateById = (id: number) => hourlyRates.find(r => r.id === id);

  // Hourly Rates CRUD handlers
  const openRateModal = (rate?: { id: number; position: string; rate: number }) => {
    if (rate) {
      setEditingRate(rate);
      setIsRateFormOpen(true);
      setTimeout(() => {
        if (ratePositionRef.current) ratePositionRef.current.value = rate.position;
        if (rateValueRef.current) rateValueRef.current.value = String(rate.rate);
      }, 0);
    } else {
      setEditingRate(null);
      setIsRateFormOpen(true);
      setTimeout(() => {
        if (ratePositionRef.current) ratePositionRef.current.value = '';
        if (rateValueRef.current) rateValueRef.current.value = '';
      }, 0);
    }
  };

  const handleSaveRate = async () => {
    const position = ratePositionRef.current?.value?.trim();
    const rate = rateValueRef.current?.value?.trim();
    if (!position || !rate) {
      alert('Заполните все поля');
      return;
    }
    try {
      const url = editingRate ? `/api/hourly-rates/${editingRate.id}` : '/api/hourly-rates';
      const method = editingRate ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position,
          rate: Number(rate),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHourlyRates(prev => {
          if (editingRate) {
            return prev.map(r => r.id === editingRate.id ? { ...r, position, rate: Number(rate) } : r);
          }
          return [...prev, data.data];
        });
        setIsRateFormOpen(false);
        setEditingRate(null);
      } else {
        alert(data.message || 'Ошибка сохранения');
      }
    } catch (e) {
      alert('Ошибка сохранения ставки');
    }
  };

  const handleDeleteRate = async (id: number) => {
    if (!confirm('Удалить эту ставку?')) return;
    try {
      const res = await fetch(`/api/hourly-rates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHourlyRates(prev => prev.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Ошибка удаления');
      }
    } catch (e) {
      alert('Ошибка удаления ставки');
    }
  };

  // Assign rate to employee
  const [assignRateId, setAssignRateId] = useState<number | null>(null);
  const [isAssignRateModalOpen, setIsAssignRateModalOpen] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState<Employee | null>(null);

  const openRateModalForEmployee = (emp: Employee) => {
    setAssigningEmployee(emp);
    setAssignRateId((emp as any).hourlyRateId || null);
    setIsAssignRateModalOpen(true);
  };

  const handleAssignRate = async () => {
    console.log('handleAssignRate:', { assignRateId, assigningEmployee });
    if (!assigningEmployee) {
      alert('Не выбран сотрудник');
      return;
    }
    if (assignRateId === null || assignRateId === undefined) {
      alert('Выберите ставку');
      return;
    }
    try {
      const url = `/api/employees/${assigningEmployee.id}`;
      console.log('PATCH', url, { hourlyRateId: assignRateId });
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRateId: assignRateId }),
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (res.ok && data.success) {
        setIsAssignRateModalOpen(false);
        setAssigningEmployee(null);
        setAssignRateId(null);
      } else {
        alert(data.message || data.error || 'Ошибка назначения');
      }
    } catch (e) {
      console.error('Assign rate error:', e);
      alert('Ошибка назначения ставки');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [
      ['Список сотрудников'],
      ['#', 'ФИО', 'Дата рождения', 'Телефон', 'Адрес', 'Дата приема', 'Место работы', 'Тип оплаты', 'Тип сотрудничества', 'Навыки', 'Ставка'],
    ];
    filteredEmployees.forEach((emp, i) => {
      const rate = getHourlyRateById((emp as any).hourlyRateId);
      rows.push([
        String(i + 1),
        emp.fullName,
        new Date(emp.birthDate).toLocaleDateString('ru-RU'),
        emp.phone,
        emp.address,
        new Date(emp.hireDate).toLocaleDateString('ru-RU'),
        emp.workplace,
        emp.paymentType,
        emp.employmentType,
        emp.skills.join(', '),
        rate ? rate.position + ' (' + rate.rate + ' ₽/ч)' : '—',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 14 }, { wch: 20 }, { wch: 35 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 25 }];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const borderStyle = { style: 'thin', color: { rgb: '000000' } };
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) continue;
        if (!ws[addr].s) ws[addr].s = {};
        ws[addr].s.border = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };
        if (R === 1) ws[addr].s.font = { bold: true };
        if (R === 0) ws[addr].s.font = { bold: true, sz: 14 };
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Сотрудники');
    XLSX.writeFile(wb, 'сотрудники_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Сотрудники</h1>
        <div className="flex gap-2">
          {activeTab === 'employees' && (
            <>
              <button
                onClick={() => setIsHourlyRateModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Ставки ({hourlyRates.length})
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Экспорт в Excel
              </button>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить сотрудника
              </button>
            </>
          )}
          {activeTab === 'brigades' && (
            <button
              onClick={() => openBrigadeModal()}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить бригаду
            </button>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'employees'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
          }`}
        >
          <Search className="w-4 h-4" />
          Сотрудники
        </button>
        <button
          onClick={() => setActiveTab('brigades')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'brigades'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Бригады ({brigades.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-[#1976d2] text-white'
              : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Навыки ({skills.length})
        </button>
      </div>

      {activeTab === 'employees' && (
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Поиск по имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                <th className="w-10"></th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">ФИО</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Номер телефона</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Адрес проживания</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Должность</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((emp) => {
                const isExpanded = expandedId === emp.id;
                return (
                  <React.Fragment key={`emp-${emp.id}`}>
                    <tr key={`row-${emp.id}`} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleExpand(emp.id)}
                          className="text-gray-400 dark:text-slate-500 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 dark:text-slate-300 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{emp.fullName}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{emp.phone}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300 max-w-xs truncate" title={emp.address}>{emp.address}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900 dark:text-white dark:text-white">{getHourlyRatePosition(emp)}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRateModalForEmployee(emp)}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Назначить ставку"
                          >
                            <BadgeCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(emp)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${emp.id}`}>
                        <td colSpan={6} className="px-6 pb-6 pt-2">
                          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1 h-5 rounded-full bg-[#1976d2]"></div>
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Детали сотрудника</h3>
                            </div>
                            <div className="grid grid-cols-5 gap-5">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Дата рождения</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white dark:text-white pl-9">{new Date(emp.birthDate).toLocaleDateString('ru-RU')}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Почасовая ставка</p>
                                </div>
                                <div className="pl-9">
                                  {(() => {
                                    const rate = getHourlyRateById((emp as any).hourlyRateId);
                                    return rate ? (
                                      <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold">
                                        {rate.position} — {rate.rate} ₽/ч
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 dark:text-slate-500 dark:text-slate-500 text-sm pl-9">Не назначена</span>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Дата приема</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white dark:text-white pl-9">{new Date(emp.hireDate).toLocaleDateString('ru-RU')}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Навыки</p>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pl-9">
                                  {emp.skills.length > 0 ? emp.skills.map(skill => (
                                    <span key={skill} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${skillColors[skill] || 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200'}`}>
                                      {skill}
                                    </span>
                                  )) : <span className="text-gray-400 dark:text-slate-500 dark:text-slate-500 text-sm">—</span>}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Место работы</p>
                                </div>
                                <div className="pl-9">
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${workplaceColors[emp.workplace]}`}>
                                    {emp.workplace}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400">Оплата / Сотрудничество</p>
                                </div>
                                <div className="flex flex-col gap-1.5 pl-9">
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${paymentTypeColors[emp.paymentType]}`}>
                                    {emp.paymentType}
                                  </span>
                                  <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${employmentTypeColors[emp.employmentType]}`}>
                                    {emp.employmentType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEmployee(null); setFormData({}); }}
        title={editingEmployee ? 'Редактировать сотрудника' : 'Новый сотрудник'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">ФИО</label>
            <input
              ref={el => { formRefs.current.fullName = el; }}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Дата рождения</label>
              <input
                ref={el => { formRefs.current.birthDate = el; }}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Дата принятия</label>
              <input
                ref={el => { formRefs.current.hireDate = el; }}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Номер телефона</label>
            <input
              ref={el => { formRefs.current.phone = el; }}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Адрес проживания</label>
            <input
              ref={el => { formRefs.current.address = el; }}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Место работы</label>
              <select
                ref={el => { formRefs.current.workplace = el; }}
                defaultValue="цех"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                <option value="цех">Цех</option>
                <option value="монтаж">Монтаж</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Тип оплаты</label>
              <select
                ref={el => { formRefs.current.paymentType = el; }}
                defaultValue="см��нная"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                <option value="сменная">Сменная</option>
                <option value="сдельная">Сдельная</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Тип сотрудничества</label>
              <select
                ref={el => { formRefs.current.employmentType = el; }}
                defaultValue="штат"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                <option value="штат">Штат</option>
                <option value="подработка">Подработка</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 mb-1">Выбрать ставку</label>
              <select
                ref={el => { formRefs.current.hourlyRateId = el; }}
                defaultValue=""
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] dark:bg-slate-700 dark:text-white"
              >
                <option value="">Не выбрана</option>
                {hourlyRates.map(rate => (
                  <option key={rate.id} value={rate.id}>
                    {rate.position} — {rate.rate} ₽/ч
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Навыки */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-2">Навыки</label>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    skills: toggleSkill(skill.name, (prev.skills || []) as SkillType[])
                  }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (formData.skills || []).includes(skill.name)
                      ? 'bg-[#1976d2] text-white'
                      : 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 dark:border-slate-700'
                  }`}
                >
                  {skill.name}
                </button>
              ))}
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
              onClick={() => { setIsModalOpen(false); setEditingEmployee(null); setFormData({}); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
      {filteredEmployees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={empTotalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
        />
      )}
      </div>
      )}

      {activeTab === 'brigades' && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Поиск по названию или навыку бригады..."
              value={brigadeSearch}
              onChange={(e) => setBrigadeSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBrigades.map((brigade) => {
              const leader = getEmployeeById(brigade.leaderId);
              const members = brigade.memberIds
                .map(id => getEmployeeById(id))
                .filter(Boolean);

              return (
                <div key={brigade.id} className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative group">
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openBrigadeModal(brigade)}
                      className="p-2 text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrigade(brigade.id)}
                      className="p-2 text-gray-500 dark:text-slate-400 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#1976d2]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[#1976d2]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white dark:text-white">{brigade.name}</h3>
                      {leader && <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">Прораб: {leader.fullName}</p>}
                    </div>
                  </div>

                  {/* Навыки бригады */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-2">Навыки</p>
                    <div className="flex flex-wrap gap-1">
                      {brigade.skills.map(skill => (
                        <span key={skill} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${skillColors[skill] || 'bg-gray-100 dark:bg-slate-700 dark:bg-slate-700 text-gray-800 dark:text-slate-200 dark:text-slate-200'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Участники */}
                  <div className="border-t border-gray-100 dark:border-slate-700 dark:border-slate-700 pt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400 dark:text-slate-400 mb-2">Участники ({members.length + 1})</p>
                    <div className="space-y-2">
                      {/* Прораб */}
                      {leader && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-[#1976d2] text-white flex items-center justify-center text-xs font-bold">
                            {leader.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300 font-medium">{leader.fullName}</span>
                          <span className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 ml-auto">прораб</span>
                        </div>
                      )}
                      {/* Остальные участники */}
                      {members.map((member, index) => (
                        <div key={`${member!.id}-${index}`} className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 text-gray-600 dark:text-slate-300 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                            {member!.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>
                          <span className="text-gray-700 dark:text-slate-300 dark:text-slate-300">{member!.fullName}</span>
                          <span className="text-xs text-gray-400 dark:text-slate-500 dark:text-slate-500 ml-auto">{member!.workplace}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBrigades.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-lg">Бригады не найдены</p>
            </div>
          )}
          {filteredBrigades.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={brigTotalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredBrigades.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}

      {/* Навыки вкладка */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white dark:text-white">Навыки</h2>
            <button
              onClick={handleAddSkill}
              className="flex items-center gap-2 bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить навык
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={skillsSearchQuery}
              onChange={(e) => setSkillsSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] text-gray-900 dark:text-white dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 dark:bg-slate-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Название</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Описание</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 dark:text-slate-300 dark:text-slate-300">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSkills.map((skill) => (
                    <tr key={skill.id} className="border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors">
                      <td className="py-4 px-6 text-gray-900 dark:text-white dark:text-white font-medium">{skill.name}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-slate-300 dark:text-slate-300">{skill.description || '—'}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEditSkill(skill)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filteredSkills.length > 0 && (
            <Pagination
              currentPage={skillsCurrentPage}
              totalPages={skillsTotalPages}
              onPageChange={setSkillsCurrentPage}
              totalItems={filteredSkills.length}
              itemsPerPage={itemsPerPageSkills}
            />
          )}
        </div>
      )}

      {/* Модальное окно списка ставок */}
      <Modal
        isOpen={isHourlyRateModalOpen}
        onClose={() => { setIsHourlyRateModalOpen(false); if (rateSearchRef.current) rateSearchRef.current.value = ''; }}
        title="Управление почасовыми ставками"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 dark:text-slate-500" />
              <input
                ref={rateSearchRef}
                type="text"
                placeholder="Поиск по вакансии..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => openRateModal()}
              className="ml-3 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>

          <div className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg max-h-80 overflow-y-auto">
            {hourlyRates
              .filter(r => {
                const search = rateSearchRef.current?.value?.toLowerCase() || '';
                return r.position.toLowerCase().includes(search);
              })
              .map(rate => (
                <div key={rate.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700 last:border-b-0 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white dark:text-white">{rate.position}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400">{rate.rate} ₽/час</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openRateModal(rate)}
                      className="p-2 text-gray-400 dark:text-slate-500 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRate(rate.id)}
                      className="p-2 text-gray-400 dark:text-slate-500 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {hourlyRates.length === 0 && (
            <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-center py-8">Нет ставок. Нажмите «Добавить» чтобы создать первую.</p>
          )}
        </div>
      </Modal>

      {/* Модальное окно добавления/редактирования ставки */}
      <Modal
        isOpen={isRateFormOpen}
        onClose={() => { setIsRateFormOpen(false); setEditingRate(null); }}
        title={editingRate ? 'Редактировать ставку' : 'Новая ставка'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Вакансия</label>
            <input
              ref={ratePositionRef}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Например: Сварщик"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Ставка (₽/час)</label>
            <input
              ref={rateValueRef}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Например: 500"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveRate}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              {editingRate ? 'Сохранить' : 'Добавить'}
            </button>
            <button
              onClick={() => { setIsRateFormOpen(false); setEditingRate(null); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно назначения ставки сотруднику */}
      <Modal
        isOpen={isAssignRateModalOpen}
        onClose={() => { setIsAssignRateModalOpen(false); setAssigningEmployee(null); setAssignRateId(null); }}
        title={`Назначить ставку — ${assigningEmployee?.fullName || ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-slate-300">Выберите ставку для этого сотрудника:</p>
          <div className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-lg max-h-64 overflow-y-auto space-y-1">
            {hourlyRates.length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 text-center py-4">Нет доступных ставок</p>
            )}
            {hourlyRates.map(rate => (
              <label
                key={rate.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                  assignRateId === rate.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="assignRate"
                  checked={assignRateId === rate.id}
                  onChange={() => setAssignRateId(rate.id)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">{rate.position}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 dark:text-slate-400">{rate.rate} ₽/час</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAssignRate}
              disabled={!assignRateId}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:bg-slate-600 dark:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Назначить
            </button>
            <button
              onClick={() => { setIsAssignRateModalOpen(false); setAssigningEmployee(null); setAssignRateId(null); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Ошибка загрузки */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {/* Модальное окно навыков */}
      <Modal
        isOpen={isSkillModalOpen}
        onClose={() => { setIsSkillModalOpen(false); setEditingSkill(null); }}
        title={editingSkill ? 'Редактировать навык' : 'Новый навык'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Название</label>
            <input ref={skillNameRef} type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" placeholder="Например: Сварка" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Описание</label>
            <textarea ref={skillDescriptionRef} className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]" rows={3} placeholder="Опциональное описание" />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveSkill}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => { setIsSkillModalOpen(false); setEditingSkill(null); }}
              className="flex-1 bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно бригады */}
      <Modal
        isOpen={isBrigadeModalOpen}
        onClose={() => { setIsBrigadeModalOpen(false); setEditingBrigade(null); }}
        title={editingBrigade ? 'Редактировать бригаду' : 'Новая бригада'}
      >
        <BrigadeForm
          editingBrigade={editingBrigade}
          employees={employees}
          workplaceColors={workplaceColors}
          skills={skills}
          onSave={handleSaveBrigadeInternal}
          onCancel={() => { setIsBrigadeModalOpen(false); setEditingBrigade(null); }}
        />
      </Modal>
    </div>
  );
}
