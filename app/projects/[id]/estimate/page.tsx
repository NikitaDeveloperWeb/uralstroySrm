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

  const handleExportPDF = useCallback(() => {
    if (activeTab === 'materials') {
      exportEstimateToPDF({
        title: 'Смета материалов',
        subtitle: `Объект: ${project?.name || ''}`,
        items: materialEstimates.map(m => ({
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
      exportEstimateToPDF({
        title: 'Смета выполненных работ',
        subtitle: `Объект: ${project?.name || ''}`,
        items: completedWorks.map(w => ({
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
  }, [activeTab, materialEstimates, completedWorks, project]);

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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900">Загрузка...</h1>
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
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50">
            📄 Экспорт PDF
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50">
            🖨 Печать
          </Button>
        </div>
      </div>

      {/* Project title */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-1">{project.address}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'materials'
                  ? 'border-b-2 border-[#1976d2] text-[#1976d2] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              📋 Смета материалов
            </button>
            <button
              onClick={() => setActiveTab('works')}
              className={`px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'works'
                  ? 'border-b-2 border-[#1976d2] text-[#1976d2] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              templates={workTemplates}
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
