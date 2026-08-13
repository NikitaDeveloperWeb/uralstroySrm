'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';
import { AddObjectForm } from '@/shared/components/dashboard/AddObjectForm';
import { Calendar } from '@/shared/components/dashboard/Calendar';
import { WeatherWidget } from '@/shared/components/dashboard/WeatherWidget';
import { ReportSelectorModal } from './ReportSelectorModal';
import { useProjectStore } from '@/shared/stores/projectStore';
import type { Brigade } from '@/shared/types/project';

export function DashboardHeader() {
  const [currentDate, setCurrentDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const createProject = useProjectStore(state => state.createProject);

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      setCurrentDate(`${day}.${month}.${year} ${hours}:${minutes}:${seconds}`);
    };

    updateDate();
    const interval = setInterval(updateDate, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchBrigades();
  }, []);

  const fetchBrigades = async () => {
    try {
      const res = await fetch('/api/brigades');
      const data = await res.json();
      if (res.ok) setBrigades(data);
    } catch (error) {
      console.error('Ошибка загрузки бригад:', error);
    }
  };

  const handleAddObject = async (formData: {
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
  }) => {
    const projectData = {
      name: formData.name,
      area: formData.area,
      address: formData.address,
      type: formData.type,
      cost: parseInt(formData.cost) || 0,
      deadline: formData.date,
      complexity: formData.complexity,
      status: 'создан',
      code: new Date().getDate().toString().padStart(2, '0') +
            (new Date().getMonth() + 1).toString().padStart(2, '0') +
            new Date().getFullYear().toString() +
            Math.floor(Math.random() * 100).toString().padStart(2, '0'),
      prepayment: formData.prepayment ? parseInt(formData.prepayment) : null,
      prepaymentDate: formData.prepaymentDate || null,
      brigadeId: formData.brigadeId ? parseInt(formData.brigadeId) : null,
    };
    await createProject(projectData);
    setShowModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-4">
          <Button onClick={() => setShowModal(true)} className="bg-[#1976d2] hover:bg-[#1565c0] text-lg font-semibold text-white h-16 px-6 rounded-lg shadow-md">
            <span className="mr-2">+</span>
            Добавить объект
          </Button>
          <Button variant="outline" onClick={() => setShowReportSelector(true)} className="border-[#1976d2] text-[#1976d2] hover:bg-[#e3f2fd] text-lg font-semibold h-16 px-6 rounded-lg shadow-md">
            <span className="mr-2">+</span>
            Добавить отчет
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-64">
            <WeatherWidget city="Златоуст" />
          </div>
          <div className="relative w-64">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full bg-[#1976d2] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#1565c0] transition-colors"
            >
              <div className="text-2xl font-bold">{currentDate}</div>
            </button>
            {showCalendar && (
              <div className="absolute right-0 mt-2 z-50">
                <Calendar />
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Добавить объект">
        <AddObjectForm onSubmit={handleAddObject} brigades={brigades} />
      </Modal>
      <ReportSelectorModal
        isOpen={showReportSelector}
        onClose={() => setShowReportSelector(false)}
      />
    </>
  );
}
