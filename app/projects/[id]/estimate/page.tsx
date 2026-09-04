'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import { useProjectStore } from '@/shared/stores/projectStore';
import { exportEstimateToPDF } from '@/shared/lib/estimatePdfExport';
import { MaterialsTab } from './MaterialsTab';
import { WorksTab } from './WorksTab';

export default function EstimatePage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const router = useRouter();
  console.log('=== EstimatePage ===', { params, id });
  
  const project = useProjectStore(state => state.projects.find(p => p.id === id));
  const fetchProjectDetail = useProjectStore(state => state.fetchProjectDetail);
  
  const materialEstimates = useMaterialEstimateStore(state => state.materialEstimates);
  const materialTemplates = useMaterialEstimateStore(state => state.materialTemplates);
  const completedWorks = useMaterialEstimateStore(state => state.completedWorks);
  const workTemplates = useMaterialEstimateStore(state => state.workTemplates);
  const fetchMaterialEstimates = useMaterialEstimateStore(state => state.fetchMaterialEstimates);
  const fetchMaterialTemplates = useMaterialEstimateStore(state => state.fetchMaterialTemplates);
  const fetchCompletedWorks = useMaterialEstimateStore(state => state.fetchCompletedWorks);
  const fetchWorkTemplates = useMaterialEstimateStore(state => state.fetchWorkTemplates);
  
  const [activeTab, setActiveTab] = useState<'materials' | 'works'>('materials');
  const [isExporting, setIsExporting] = useState(false);

  // Load project detail
  useEffect(() => {
    if (id && !project) {
      fetchProjectDetail(id);
    }
  }, [id, project, fetchProjectDetail]);

  // Load estimates and templates
  useEffect(() => {
    fetchMaterialEstimates(id);
    fetchCompletedWorks(id);
    fetchMaterialTemplates();
    fetchWorkTemplates();
  }, [id, fetchMaterialEstimates, fetchCompletedWorks, fetchMaterialTemplates, fetchWorkTemplates]);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    
    const items = activeTab === 'materials' ? materialEstimates : completedWorks;
    if (!items || items.length === 0) {
      console.warn('Нет данных для экспорта');
      return;
    }
    
    setIsExporting(true);
    try {
      if (activeTab === 'materials') {
        await exportEstimateToPDF({
          title: 'Смета материалов',
          subtitle: `Объект: ${project?.name || ''}`,
          items: items.map(m => ({
            id: m.id,
            name: m.name,
            quantity: m.quantity,
            cost: m.cost,
            category: m.category || undefined,
          })),
          projectName: project?.name,
          projectId: project?.id,
        });
      } else {
        await exportEstimateToPDF({
          title: 'Смета выполненных работ',
          subtitle: `Объект: ${project?.name || ''}`,
          items: items.map(w => ({
            id: w.id,
            name: w.name,
            quantity: w.quantity,
            cost: w.cost,
            category: w.category || undefined,
          })),
          projectName: project?.name,
          projectId: project?.id,
        });
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, materialEstimates, completedWorks, project, isExporting]);

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/projects/${id}`}
            className="flex items-center gap-2 text-[#1976d2] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Назад к объекту
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">Загрузка...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/projects/${id}`}
          className="flex items-center gap-2 text-[#1976d2] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Назад к объекту
        </Link>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || !project}
            variant="outline"
            className="border-gray-300 dark:border-slate-600 dark:border-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700">
            {isExporting ? '⏳ Экспорт...' : '📄 Экспорт PDF'}
          </Button>
        </div>
      </div>

      {/* Project title */}
      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{project.name}</h1>
        <p className="text-gray-500 dark:text-slate-400 dark:text-slate-400 mt-1">{project.address}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'materials'
                  ? 'border-b-2 border-[#1976d2] text-[#1976d2] bg-blue-50'
                  : 'text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:text-gray-900 dark:text-white dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700'
              }`}>
              📋 Смета материалов
            </button>
            <button
              onClick={() => setActiveTab('works')}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'works'
                  ? 'border-b-2 border-[#1976d2] text-[#1976d2] bg-blue-50'
                  : 'text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:text-gray-900 dark:text-white dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 dark:bg-slate-700'
              }`}>
              📋 Смета выполненных работ
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'materials' ? (
            <MaterialsTab
              items={materialEstimates}
              templates={materialTemplates}
              onSave={() => fetchMaterialEstimates(id)}
              isSaving={false}
              projectId={id}
            />
          ) : (
            <WorksTab
              items={completedWorks}
              onSave={() => fetchCompletedWorks(id)}
              isSaving={false}
              projectId={id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
