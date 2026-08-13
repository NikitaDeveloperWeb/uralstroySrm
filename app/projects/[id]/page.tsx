'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Pencil, Banknote, Users, Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/Modal';
import { EditableTable } from '@/shared/components/projects/EditableTable';
import { TemplatePickerModal } from '@/shared/components/projects/TemplatePickerModal';
import { PaymentTable } from '@/shared/components/projects/PaymentTable';
import { ManagerPayment } from '@/shared/components/projects/ManagerPayment';
import { materialToEdit, workToEdit } from '@/shared/lib/edit-helpers';
import { useProjectStore } from '@/shared/stores/projectStore';
import { useProjectTransactionStore } from '@/shared/stores/projectTransactionStore';
import { TransactionTable } from '@/shared/components/projects/TransactionTable';
import type { Project, ProjectMaterial, ProjectCompletedWork, Brigade } from '@/shared/types/project';

interface MaterialEstimate {
  id?: number;
  material: string;
  quantity: string;
  cost: number;
  category: string;
}

interface WorkEstimate {
  id?: number;
  work: string;
  quantity: string;
  cost: number;
  category: string;
}

interface PaymentCategory {
  name: string;
  percentage: number;
}

interface TemplateItem {
  id: number;
  name: string;
  quantity: string;
  cost: number;
  category?: string;
}

interface OverheadTemplateItem {
  id: number;
  name: string;
  cost: number;
  category?: string;
}

const complexityColors: Record<string, string> = {
  легкий: 'bg-green-500',
  средний: 'bg-yellow-500',
  сложный: 'bg-red-500',
};

const statusColors: Record<string, string> = {
  создан: 'bg-gray-500',
  'в работе': 'bg-blue-500',
  завершен: 'bg-green-500',
};

const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};

const defaultPaymentCategories: PaymentCategory[] = [
  { name: 'Цех', percentage: 30 },
  { name: 'Монтажники', percentage: 45 },
  { name: 'Премия цеха', percentage: 10 },
  { name: 'Дополнительно', percentage: 15 },
];

const banyaPaymentCategories: PaymentCategory[] = [
  { name: 'Цех', percentage: 5 },
  { name: 'Монтажники', percentage: 5 },
  { name: 'Премия цеха', percentage: 2.5 },
  { name: 'Премия монтажников', percentage: 2.5 },
];

const managerPercentage = 5;

export default function ObjectDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const router = useRouter();
  const project = useProjectStore((state) => state.projects.find((p) => p.id === id));
  const fetchProjectDetail = useProjectStore((state) => state.fetchProjectDetail);

  const updateProject = useProjectStore((state) => state.updateProject);
  const materials = useProjectStore((state) => state.materials);
  const completedWorks = useProjectStore((state) => state.completedWorks);
  const materialTemplates = useProjectStore((state) => state.materialTemplates);
  const workTemplates = useProjectStore((state) => state.workTemplates);
  const fetchMaterialTemplates = useProjectStore((state) => state.fetchMaterialTemplates);
  const fetchWorkTemplates = useProjectStore((state) => state.fetchWorkTemplates);
  const fetchProjectMaterials = useProjectStore((state) => state.fetchProjectMaterials);
  const fetchProjectCompletedWorks = useProjectStore((state) => state.fetchProjectCompletedWorks);

  // Transaction store hooks
  const transactions = useProjectTransactionStore((state) => state.transactions);
  const fetchTransactions = useProjectTransactionStore((state) => state.fetchTransactions);
  const createTransaction = useProjectTransactionStore((state) => state.createTransaction);
  const updateTransaction = useProjectTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useProjectTransactionStore((state) => state.deleteTransaction);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showOverheadsModal, setShowOverheadsModal] = useState(false);
  const [savingOverheads, setSavingOverheads] = useState(false);
  const [overheads, setOverheads] = useState<
    { id?: number; name: string; cost: number; category?: string | null }[]
  >([]);
  const [overheadTemplates, setOverheadTemplates] = useState<OverheadTemplateItem[]>([]);
  const [overheadsEditIndex, setOverheadsEditIndex] = useState<number | null>(null);
  const [editOverheads, setEditOverheads] = useState<
    { id?: number; name: string; cost: number; category?: string | null }[]
  >([]);
  const [originalMaterials, setOriginalMaterials] = useState<
    { id?: number; name: string; quantity: string; cost: number; category: string }[]
  >([]);
  const [originalWorks, setOriginalWorks] = useState<
    { id?: number; name: string; quantity: string; cost: number; category: string }[]
  >([]);
  const [materialsEditIndex, setMaterialsEditIndex] = useState<number | null>(null);
  const [workEditIndex, setWorkEditIndex] = useState<number | null>(null);
  const [editMaterials, setEditMaterials] = useState<MaterialEstimate[]>([]);
  const [editWorks, setEditWorks] = useState<WorkEstimate[]>([]);
  const [savingMaterials, setSavingMaterials] = useState(false);
  const [savingWorks, setSavingWorks] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState<(string | null)[]>(
    defaultPaymentCategories.map(() => null),
  );
  const [showMaterialTemplatePicker, setShowMaterialTemplatePicker] = useState(false);
  const [showWorkTemplatePicker, setShowWorkTemplatePicker] = useState(false);
  const [showOverheadTemplatePicker, setShowOverheadTemplatePicker] = useState(false);
  const [selectedMaterialTemplate, setSelectedMaterialTemplate] = useState<number | null>(null);
  const [selectedWorkTemplate, setSelectedWorkTemplate] = useState<number | null>(null);
  const [showBrigadeModal, setShowBrigadeModal] = useState(false);
  const [selectedBrigadeId, setSelectedBrigadeId] = useState<number | undefined>(project?.brigade?.id);
  const [brigades, setBrigades] = useState<Brigade[]>([]);

  // Collapse states for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    objectCard: false,
    estimate: false,
    labor: false,
    transactions: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const editableMaterials =
    editMaterials.length > 0
      ? editMaterials
      : materials.map((item) => ({
          id: item.id,
          material: item.name,
          quantity: item.quantity,
          cost: item.cost,
          category: item.category || '',
        }));
  const editableWorks =
    editWorks.length > 0
      ? editWorks
      : completedWorks.map((item) => ({
          id: item.id,
          work: item.name,
          quantity: item.quantity,
          cost: item.cost,
          category: item.category || '',
        }));
  const editableOverheads = editOverheads.length > 0 ? editOverheads : overheads;

  const fetchOverheads = async () => {
    if (project) {
      try {
        const res = await fetch(`/api/project-overheads?projectId=${project.id}`);
        if (res.ok) {
          const data = await res.json();
          setOverheads(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch overheads', e);
      }
    }
  };

  const saveOverheads = async () => {
    if (!project || editOverheads.length === 0) return;
    setSavingOverheads(true);
    try {
      for (const overhead of editOverheads) {
        if (overhead.id) {
          await fetch(`/api/project-overheads/${overhead.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: overhead.name,
              cost: overhead.cost,
              category: (overhead as any).category || null,
            }),
          }).catch(() => {});
        } else {
          await fetch('/api/project-overheads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              name: overhead.name,
              cost: overhead.cost,
              category: (overhead as any).category || null,
            }),
          }).catch(() => {});
        }
      }
      // Delete removed items
      for (const o of overheads) {
        if (!editOverheads.some((e) => e.id === o.id)) {
          await fetch(`/api/project-overheads/${o.id}`, { method: 'DELETE' }).catch(() => {});
        }
      }
      await fetchOverheads();
      setEditOverheads([]);
      setOverheadsEditIndex(null);
    } catch (error) {
      console.error('Ошибка сохранения расходов:', error);
    } finally {
      setSavingOverheads(false);
    }
  };

  const fetchOverheadTemplates = async () => {
    try {
      const res = await fetch('/api/project-overhead-templates');
      if (res.ok) {
        const data = await res.json();
        setOverheadTemplates(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch overhead templates', e);
    }
  };

  const addOverheadFromTemplate = async (template: {
    name: string;
    cost: number;
    category?: string | null;
  }) => {
    if (project) {
      // Check if already exists in the database
      const res = await fetch(`/api/project-overheads?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        const exists = (data.data || []).some((h: any) => h.name === template.name);
        if (!exists) {
          await fetch('/api/project-overheads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: project.id,
              name: template.name,
              cost: template.cost,
              category: template.category || null,
            }),
          }).catch(() => {});
          await fetchOverheads();
        }
      }
      setShowOverheadTemplatePicker(false);
    }
  };

  useEffect(() => {
    if (id && !project) {
      fetchProjectDetail(id);
    }
  }, [id, project, fetchProjectDetail]);

  useEffect(() => {
    if (id && project) {
      fetchProjectMaterials(id);
      fetchProjectCompletedWorks(id);
      fetchTransactions(id);
    }
  }, [id, project, fetchProjectMaterials, fetchProjectCompletedWorks, fetchTransactions]);

  const fetchBrigades = async () => {
    try {
      const res = await fetch('/api/brigades');
      if (res.ok) {
        const data = await res.json();
        setBrigades(data.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch brigades', e);
    }
  };

  const handleAssignBrigade = async () => {
    if (!project || selectedBrigadeId == null) return;
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brigadeId: selectedBrigadeId }),
      });
      setShowBrigadeModal(false);
      fetchProjectDetail(project.id);
    } catch (e) {
      console.error('Failed to assign brigade', e);
    }
  };

  useEffect(() => {
    fetchMaterialTemplates();
    fetchWorkTemplates();
    fetchOverheadTemplates();
    if (project) fetchOverheads();
    fetchBrigades();
    if (project) setSelectedBrigadeId(project.brigade?.id);
  }, [fetchMaterialTemplates, fetchWorkTemplates, project]);

  const handleEdit = () => {
    if (project) {
      setEditForm({ ...project });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (project) {
      await updateProject(project.id, editForm);
      setShowEditModal(false);
      setEditForm({});
    }
  };

  const handleMaterialsEdit = (index: number) => {
    setMaterialsEditIndex(index);
    setEditMaterials(editableMaterials.map((m) => ({ ...m })));
  };

  const handleWorkEdit = (index: number) => {
    setWorkEditIndex(index);
    setEditWorks(editableWorks.map((w) => ({ ...w })));
  };

  const togglePaymentStatus = (index: number) => {
    setPaymentStatuses((prev) => {
      const next = [...prev];
      next[index] = next[index] === 'executed' ? null : 'executed';
      return next;
    });
  };

  const handleStatusChange = async (status: string) => {
    if (project) {
      await updateProject(project.id, { status });
    }
  };

  const handleMaterialsSave = async () => {
    setMaterialsEditIndex(null);
    // Save materials to DB using point operations
    if (project) {
      setSavingMaterials(true);
      try {
        for (const mat of editMaterials) {
          if (mat.id) {
            // Update existing
            await fetch(`/api/material-estimates/${mat.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: mat.material,
                quantity: mat.quantity,
                cost: mat.cost,
              }),
            }).catch(() => {});
          } else {
            // Create new
            await fetch('/api/material-estimates', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: project.id,
                name: mat.material,
                quantity: mat.quantity,
                cost: mat.cost,
              }),
            }).catch(() => {});
          }
        }
        // Delete removed items (compare with original snapshot)
        for (const origMat of originalMaterials) {
          if (origMat.id && !editMaterials.some((e) => e.id === origMat.id)) {
            await fetch(`/api/material-estimates/${origMat.id}`, { method: 'DELETE' }).catch(
              () => {},
            );
          }
        }
        await fetchProjectMaterials(project.id);
      } finally {
        setSavingMaterials(false);
        setEditMaterials([]);
        setOriginalMaterials([]);
        setMaterialsEditIndex(null);
      }
    }
  };

  const handleMaterialsCancel = () => {
    setMaterialsEditIndex(null);
    setEditMaterials([]);
    setOriginalMaterials([]);
  };

  const addMaterialRow = () => {
    setEditMaterials([...editMaterials, { material: '', quantity: '', cost: 0, category: '' }]);
    setMaterialsEditIndex(0);
  };

  const removeMaterialRow = (index: number) => {
    setEditMaterials(editMaterials.filter((_, i) => i !== index));
  };

  const applyMaterialTemplate = async (templateId: number) => {
    const template = materialTemplates.find((t) => t.id === templateId);
    if (template && project) {
      // Check if already exists
      const exists = editMaterials.some((m) => m.material === template.name);
      if (!exists) {
        setEditMaterials([
          ...editMaterials,
          {
            material: template.name,
            quantity: template.quantity,
            cost: template.cost,
            category: template.category || '',
          },
        ]);
      }
      setSelectedMaterialTemplate(null);
      setShowMaterialTemplatePicker(false);
      await fetchProjectMaterials(project.id);
    }
  };

  const addMaterialFromTemplate = (template: {
    name: string;
    quantity?: string;
    cost: number;
    category?: string | null;
  }) => {
    if (project && template.quantity) {
      fetch('/api/material-estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: template.name,
          quantity: template.quantity,
          cost: template.cost,
        }),
      })
        .then(() => fetchProjectMaterials(project.id))
        .catch(() => {});
    }
  };

  const removeMaterial = async (id: number) => {
    await fetch(`/api/material-estimates/${id}`, { method: 'DELETE' }).catch(() => {});
    if (project) {
      await fetchProjectMaterials(project.id);
    }
  };

  const handleWorkSave = async () => {
    setWorkEditIndex(null);
    // Save works to DB using point operations
    if (project) {
      setSavingWorks(true);
      try {
        for (const work of editWorks) {
          if (work.id) {
            // Update existing
            await fetch(`/api/completed-works/${work.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: work.work,
                quantity: work.quantity,
                cost: work.cost,
              }),
            }).catch(() => {});
          } else {
            // Create new
            await fetch('/api/completed-works', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId: project.id,
                name: work.work,
                quantity: work.quantity,
                cost: work.cost,
              }),
            }).catch(() => {});
          }
        }
        // Delete removed items (compare with original snapshot)
        for (const origWork of originalWorks) {
          if (origWork.id && !editWorks.some((e) => e.id === origWork.id)) {
            await fetch(`/api/completed-works/${origWork.id}`, { method: 'DELETE' }).catch(
              () => {},
            );
          }
        }
        await fetchProjectCompletedWorks(project.id);
      } finally {
        setSavingWorks(false);
        setEditWorks([]);
        setOriginalWorks([]);
        setWorkEditIndex(null);
      }
    }
  };

  const handleWorkCancel = () => {
    setWorkEditIndex(null);
    setEditWorks([]);
    setOriginalWorks([]);
  };

  const addWorkRow = () => {
    setEditWorks([...editWorks, { work: '', quantity: '', cost: 0, category: '' }]);
    setWorkEditIndex(0);
  };

  const removeWorkRow = (index: number) => {
    setEditWorks(editWorks.filter((_, i) => i !== index));
  };

  const applyWorkTemplate = async (templateId: number) => {
    const template = workTemplates.find((t) => t.id === templateId);
    if (template && project) {
      const exists = editWorks.some((w) => w.work === template.name);
      if (!exists) {
        setEditWorks([
          ...editWorks,
          {
            work: template.name,
            quantity: template.quantity,
            cost: template.cost,
            category: template.category || '',
          },
        ]);
      }
      setSelectedWorkTemplate(null);
      setShowWorkTemplatePicker(false);
      await fetchProjectCompletedWorks(project.id);
    }
  };

  const addWorkFromTemplate = (template: {
    name: string;
    quantity?: string;
    cost: number;
    category?: string | null;
  }) => {
    if (project && template.quantity) {
      fetch('/api/completed-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: template.name,
          quantity: template.quantity,
          cost: template.cost,
        }),
      })
        .then(() => fetchProjectCompletedWorks(project.id))
        .catch(() => {});
    }
  };

  const removeWork = async (id: number) => {
    await fetch(`/api/completed-works/${id}`, { method: 'DELETE' }).catch(() => {});
    if (project) {
      await fetchProjectCompletedWorks(project.id);
    }
  };

  if (!project) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Загрузка...</h1>
      </div>
    );
  }

  const typeIcon = typeIcons[project.type] || '🏗';
  const projectCost = parseInt(String(project.cost));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/projects" className="text-[#1976d2] hover:underline">
          ← Назад
        </Link>
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 transition-colors">
          <Pencil className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="text-6xl">{typeIcon}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 text-lg">{project.address}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-1 rounded">
              #{project.id}
            </span>
            <div className={`w-4 h-4 rounded-full ${statusColors[project.status]}`} />
            <span className="text-gray-600 font-medium">{project.status}</span>
          </div>
        </div>

        {/* Секция бригады */}
        {project.brigade && (
          <div className="mb-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{project.brigade.name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedBrigadeId(project.brigade?.id);
                  setShowBrigadeModal(true);
                }}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                Сменить бригаду
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Навыки бригады</p>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const skills =
                      typeof project.brigade.skills === 'string'
                        ? JSON.parse(project.brigade.skills)
                        : project.brigade.skills;
                    return Array.isArray(skills)
                      ? skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {skill}
                          </span>
                        ))
                      : [];
                  })()}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Состав бригады</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">Прораб: 1 чел.</p>
                  <p className="text-gray-700">
                    Всего участников:{' '}
                    {(() => {
                      const memberIds =
                        typeof project.brigade.memberIds === 'string'
                          ? JSON.parse(project.brigade.memberIds)
                          : project.brigade.memberIds;
                      return Array.isArray(memberIds) ? memberIds.length + 1 : 1;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-3">Статус объекта</p>
          <div className="flex gap-4">
            {['создан', 'в работе', 'завершен'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  project.status === status
                    ? statusColors[status] + ' text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Тип объекта</p>
            <p className="text-xl font-semibold text-gray-900">{project.type}</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Площадь</p>
            <p className="text-xl font-semibold text-gray-900">{project.area} м²</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Стоимость</p>
            <p className="text-xl font-semibold text-gray-900">{projectCost.toLocaleString()} ₽</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Дата сдачи</p>
            <p className="text-xl font-semibold text-gray-900">
              {new Date(project.deadline).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Сложность</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  project.complexity === 'легкий'
                    ? 'bg-green-500'
                    : project.complexity === 'средний'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <p className="text-xl font-semibold text-gray-900">{project.complexity}</p>
            </div>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <p className="text-sm text-gray-500 mb-1">Адрес</p>
            <p className="text-xl font-semibold text-gray-900">{project.address}</p>
          </div>
        </div>
        {project.prepayment !== null && project.prepayment !== undefined && (
          <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Предоплата</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Сумма предоплаты</p>
                <p className="text-2xl font-bold text-green-600">
                  {project.prepayment.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Дата предоплаты</p>
                <p className="text-lg font-semibold text-gray-900">
                  {project.prepaymentDate
                    ? new Date(project.prepaymentDate).toLocaleDateString('ru-RU')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Остаток к оплате</p>
                <p className="text-2xl font-bold text-[#1976d2]">
                  {(projectCost - project.prepayment).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Оплачено</span>
                <span>{Math.round((project.prepayment / projectCost) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.round((project.prepayment / projectCost) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {/* Секция карты объекта */}
        {project.floors ||
        project.roofType ||
        project.foundations ||
        project.walls ||
        project.hasMansard ||
        project.hasVeranda ||
        project.hasPorhch ||
        project.communication ||
        project.description ||
        project.baseType ||
        project.homeType ||
        project.roofMaterial ||
        project.layout ||
        project.insulationThickness ? (
          <div className="mb-6 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
            <button
              onClick={() => toggleSection('objectCard')}
              className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors">
              <h2 className="text-xl font-bold text-gray-900">🏗 Карта объекта</h2>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${collapsedSections.objectCard ? '' : 'rotate-180'}`}
              />
            </button>
            {!collapsedSections.objectCard && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.floors && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Этажей</p>
                      <p className="text-lg font-bold text-gray-900">{project.floors}</p>
                    </div>
                  )}
                  {project.roofType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Тип крыши</p>
                      <p className="text-sm font-semibold text-gray-900">{project.roofType}</p>
                    </div>
                  )}
                  {project.roofColor && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Цвет крыши</p>
                      <p className="text-sm font-semibold text-gray-900">{project.roofColor}</p>
                    </div>
                  )}
                  {project.hasMansard !== null && project.hasMansard !== undefined && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Мансарда</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {project.hasMansard ? '✅ Да' : '❌ Нет'}
                      </p>
                    </div>
                  )}
                  {project.hasVeranda !== null && project.hasVeranda !== undefined && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Веранда</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {project.hasVeranda ? '✅ Да' : '❌ Нет'}
                        {project.verandaSize && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({project.verandaSize})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {project.hasPorhch !== null && project.hasPorhch !== undefined && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Крыльцо</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {project.hasPorhch ? '✅ Да' : '❌ Нет'}
                      </p>
                    </div>
                  )}
                  {project.foundations && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Фундамент</p>
                      <p className="text-sm font-semibold text-gray-900">{project.foundations}</p>
                    </div>
                  )}
                  {project.walls && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Стены</p>
                      <p className="text-sm font-semibold text-gray-900">{project.walls}</p>
                    </div>
                  )}
                  {project.insulation && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Утепление</p>
                      <p className="text-sm font-semibold text-gray-900">{project.insulation}</p>
                    </div>
                  )}
                  {project.windows && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Окна</p>
                      <p className="text-sm font-semibold text-gray-900">{project.windows}</p>
                    </div>
                  )}
                  {project.doorType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Двери</p>
                      <p className="text-sm font-semibold text-gray-900">{project.doorType}</p>
                    </div>
                  )}
                  {project.baseType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Основание</p>
                      <p className="text-sm font-semibold text-gray-900">{project.baseType}</p>
                    </div>
                  )}
                  {project.homeType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Тип дома</p>
                      <p className="text-sm font-semibold text-gray-900">{project.homeType}</p>
                    </div>
                  )}
                  {project.insulationThickness && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Толщина утепления</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {project.insulationThickness}
                      </p>
                    </div>
                  )}
                  {project.baseType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Основание</p>
                      <p className="text-sm font-semibold text-gray-900">{project.baseType}</p>
                    </div>
                  )}
                  {project.homeType && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Тип дома</p>
                      <p className="text-sm font-semibold text-gray-900">{project.homeType}</p>
                    </div>
                  )}
                  {project.roofMaterial && (
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-500 mb-1">Тип кровли</p>
                      <p className="text-sm font-semibold text-gray-900">{project.roofMaterial}</p>
                    </div>
                  )}
                </div>
                {project.communication && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Коммуникации</p>
                    <p className="text-sm text-gray-900">{project.communication}</p>
                  </div>
                )}
                {project.description && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Описание</p>
                    <p className="text-sm text-gray-900">{project.description}</p>
                  </div>
                )}
                {project.layout && (
                  <div className="mt-4 bg-white p-4 rounded-lg border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Планировка</p>
                    <p className="text-sm text-gray-900 whitespace-pre-line">{project.layout}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600">
              ℹ️ Карта объекта не заполнена.{' '}
              <button onClick={handleEdit} className="text-blue-600 hover:underline font-medium">
                Заполнить данные
              </button>
            </p>
          </div>
        )}

        {/* Блок смет и расходов */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('estimate')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <h2 className="text-xl font-bold text-gray-900">📋 Сметы и расходы</h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${collapsedSections.estimate ? '' : 'rotate-180'}`}
            />
          </button>
          {!collapsedSections.estimate && (
            <div className="p-4 pt-0">
              <div className="mb-6 flex gap-3">
                <Button
                  onClick={() => {
                    setShowMaterialsModal(true);
                    setSelectedMaterialTemplate(null);
                  }}
                  className="bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold">
                  📋 Смета материалов
                </Button>
                <Button
                  onClick={() => {
                    setShowWorkModal(true);
                    setSelectedWorkTemplate(null);
                  }}
                  className="bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold">
                  📋 Смета выполненных работ
                </Button>
                <Button
                  onClick={() => {
                    setShowOverheadsModal(true);
                    if (project) fetchOverheads();
                  }}
                  className="bg-[#1976d2] hover:bg-[#1565c0] text-white font-semibold">
                  💰 Общие расходы
                </Button>
                <Button
                  onClick={() => {
                    setSelectedBrigadeId(project?.brigade?.id);
                    setShowBrigadeModal(true);
                  }}
                  className="bg-[#8e24aa] hover:bg-[#7b1fa2] text-white font-semibold">
                  👷 Назначить бригаду
                </Button>
                <Button
                  disabled
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold">
                  🖨 Распечатать
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Блок оплаты труда */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('labor')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <h2 className="text-xl font-bold text-gray-900">👷 Оплата труда</h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${collapsedSections.labor ? '' : 'rotate-180'}`}
            />
          </button>
          {!collapsedSections.labor && (
            <div className="p-4 pt-0">
              {(() => {
                const categories =
                  project.type === 'баня' ? banyaPaymentCategories : defaultPaymentCategories;
                return (
                  <>
                    <PaymentTable
                      categories={categories}
                      projectCost={projectCost}
                      paymentStatuses={paymentStatuses}
                      onToggleStatus={togglePaymentStatus}
                    />
                    <ManagerPayment projectCost={projectCost} percentage={managerPercentage} />
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Блок транзакций */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('transactions')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <h2 className="text-xl font-bold text-gray-900">💳 Транзакции</h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${collapsedSections.transactions ? '' : 'rotate-180'}`}
            />
          </button>
          {!collapsedSections.transactions && (
            <div className="p-4 pt-0">
              <TransactionTable
                transactions={transactions}
                projectCost={projectCost}
                loading={useProjectTransactionStore.getState().loading}
                error={useProjectTransactionStore.getState().error}
                onCreate={async (data) => {
                  await createTransaction({ projectId: id, ...data });
                  await fetchTransactions(id);
                }}
                onUpdate={async (transactionId, data) => {
                  await updateTransaction(id, transactionId, data);
                  await fetchTransactions(id);
                }}
                onDelete={async (transactionId) => {
                  await deleteTransaction(id, transactionId);
                  await fetchTransactions(id);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
        title="Смета материалов"
        maxWidth="max-w-[80vw]"
        maxHeight="max-h-[70vh]">
        <EditableTable
          items={editableMaterials}
          editItems={editMaterials}
          editIndex={materialsEditIndex}
          title="Материал"
          itemName="material"
          onPrint={() => window.print()}
          onOpenTemplate={() => setShowMaterialTemplatePicker(true)}
          onAddRow={() =>
            setEditMaterials([
              ...editMaterials,
              { material: '', quantity: '', cost: 0, category: '' },
            ])
          }
          onEdit={(i) => {
            setMaterialsEditIndex(i);
            setEditMaterials(editableMaterials.map((m) => ({ ...m })));
            setOriginalMaterials(editableMaterials.map((m) => ({ ...m })));
          }}
          onSave={handleMaterialsSave}
          onCancel={handleMaterialsCancel}
          onRemoveRow={(i) => setEditMaterials(editMaterials.filter((_, idx) => idx !== i))}
          onRowChange={(i, field, value) => {
            const copy = [...editMaterials];
            copy[i] = { ...copy[i], [field]: value };
            setEditMaterials(copy);
          }}
          isSaving={savingMaterials}
        />
      </Modal>
      <Modal
        isOpen={showWorkModal}
        onClose={() => setShowWorkModal(false)}
        title="Смета выполненных работ"
        maxWidth="max-w-[80vw]"
        maxHeight="max-h-[70vh]">
        <EditableTable
          items={editableWorks}
          editItems={editWorks}
          editIndex={workEditIndex}
          title="Работа"
          itemName="work"
          onPrint={() => window.print()}
          onOpenTemplate={() => setShowWorkTemplatePicker(true)}
          onAddRow={() =>
            setEditWorks([...editWorks, { work: '', quantity: '', cost: 0, category: '' }])
          }
          onEdit={(i) => {
            setWorkEditIndex(i);
            setEditWorks(editableWorks.map((w) => ({ ...w })));
            setOriginalWorks(editableWorks.map((w) => ({ ...w })));
          }}
          onSave={handleWorkSave}
          onCancel={handleWorkCancel}
          onRemoveRow={(i) => setEditWorks(editWorks.filter((_, idx) => idx !== i))}
          onRowChange={(i, field, value) => {
            const copy = [...editWorks];
            copy[i] = { ...copy[i], [field]: value };
            setEditWorks(copy);
          }}
          isSaving={savingWorks}
        />
      </Modal>
      <Modal
        isOpen={showOverheadsModal}
        onClose={() => setShowOverheadsModal(false)}
        title="Общие расходы"
        maxWidth="max-w-[80vw]"
        maxHeight="max-h-[70vh]">
        <div className="mb-4 flex gap-3 flex-wrap">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50">
            🖨 Печать
          </Button>
          {overheadsEditIndex === null ? (
            <>
              <Button
                onClick={() => setShowOverheadTemplatePicker(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                📑 Шаблоны
              </Button>
              <Button
                onClick={() => {
                  setOverheadsEditIndex(0);
                  setEditOverheads(editableOverheads.map((h) => ({ ...h })));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Pencil className="w-4 h-4 mr-2" /> Редактировать
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() =>
                  setEditOverheads([...editOverheads, { name: '', cost: 0, category: undefined }])
                }
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50">
                <Plus className="w-4 h-4 mr-2" /> Добавить строку
              </Button>
              <Button
                onClick={saveOverheads}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                disabled={savingOverheads}>
                <Save className="w-4 h-4 mr-2" />
                {savingOverheads ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                onClick={() => setOverheadsEditIndex(null)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <X className="w-4 h-4 mr-2" /> Отмена
              </Button>
            </>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">#</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Расход</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-32">
                Категория
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-36">
                Стоимость (₽)
              </th>
              {overheadsEditIndex !== null && (
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-28">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {editableOverheads.map((h, i) => {
              const overhead = editOverheads[i] || h;
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 text-sm">{i + 1}</td>
                  {overheadsEditIndex !== null ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          value={overhead.name || ''}
                          onChange={(e) => {
                            const copy = [...editOverheads];
                            copy[i] = { ...copy[i], name: e.target.value };
                            setEditOverheads(copy);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          value={overhead.category || ''}
                          onChange={(e) => {
                            const copy = [...editOverheads];
                            copy[i] = { ...copy[i], category: e.target.value || null };
                            setEditOverheads(copy);
                          }}
                          placeholder="Категория"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <input
                          type="number"
                          value={overhead.cost || 0}
                          onChange={(e) => {
                            const copy = [...editOverheads];
                            copy[i] = { ...copy[i], cost: Number(e.target.value) };
                            setEditOverheads(copy);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            setEditOverheads(editOverheads.filter((_, idx) => idx !== i))
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Удалить строку">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-gray-900">{h.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 text-sm">{h.category || '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {h.cost?.toLocaleString('ru-RU') || '0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setOverheadsEditIndex(i);
                            setEditOverheads(editableOverheads.map((hh) => ({ ...hh })));
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Редактировать">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50">
              <td className="py-3 px-4 font-bold text-gray-900" colSpan={3}>
                Итого
              </td>
              <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">
                {editableOverheads
                  .reduce((sum, h) => sum + (h.cost || 0), 0)
                  .toLocaleString('ru-RU')}{' '}
                ₽
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </Modal>
      <div className="flex justify-center mt-8">
        <Button
          onClick={() => setShowReportModal(true)}
          className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold px-12 py-3 text-lg rounded-lg shadow-md">
          📝 Создать отчет
        </Button>
      </div>
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Создать отчет по объекту">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата отчета</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Период с</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Период по</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea
              rows={4}
              placeholder="Введите комментарий к отчету..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors">
              Создать отчет
            </button>
            <button
              onClick={() => setShowReportModal(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold text-lg transition-colors">
              Отмена
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({});
        }}
        title="Редактировать объект">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input
              type="text"
              value={editForm.name || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
              <input
                type="text"
                value={editForm.type || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Площадь (м²)</label>
              <input
                type="text"
                value={editForm.area || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, area: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input
              type="text"
              value={editForm.address || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
              <input
                type="number"
                value={editForm.cost ?? ''}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    cost: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата сдачи</label>
              <input
                type="date"
                value={editForm.deadline || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сложность</label>
              <select
                value={editForm.complexity || 'средний'}
                onChange={(e) => setEditForm((prev) => ({ ...prev, complexity: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="легкий">Легкий</option>
                <option value="средний">Средний</option>
                <option value="сложный">Сложный</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={editForm.status || 'создан'}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="создан">Создан</option>
                <option value="в работе">В работе</option>
                <option value="завершен">Завершен</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код объекта</label>
            <input
              type="text"
              value={editForm.code || ''}
              onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сумма предоплаты
              </label>
              <input
                type="number"
                value={editForm.prepayment ?? ''}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    prepayment: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата предоплаты
              </label>
              <input
                type="date"
                value={editForm.prepaymentDate || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, prepaymentDate: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
              />
            </div>
          </div>

          {/* Секция карты объекта */}
          <div className="pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏗 Карта объекта</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество этажей
                </label>
                <input
                  type="number"
                  value={editForm.floors ?? ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      floors: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип крыши</label>
                <select
                  value={editForm.roofType || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, roofType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="односкатная">Односкатная</option>
                  <option value="двускатная">Двускатная</option>
                  <option value="вальмовая">Вальмовая</option>
                  <option value="шатровая">Шатровая</option>
                  <option value="другое">Другое</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цвет крыши</label>
                <input
                  type="text"
                  value={editForm.roofColor || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, roofColor: e.target.value }))}
                  placeholder="Красный, коричневый..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип фундамента
                </label>
                <select
                  value={editForm.foundations || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, foundations: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="ленточный">Ленточный</option>
                  <option value="свайный">Свайный</option>
                  <option value="плитный">Плитный</option>
                  <option value="столбчатый">Столбчатый</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип стен</label>
                <select
                  value={editForm.walls || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, walls: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="кирпич">Кирпич</option>
                  <option value="газобетон">Газобетон</option>
                  <option value="дерево">Дерево</option>
                  <option value="каркас">Каркас</option>
                  <option value="SIP-панели">SIP-панели</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип утепления
                </label>
                <select
                  value={editForm.insulation || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, insulation: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="минеральная вата">Минеральная вата</option>
                  <option value="пенополистирол">Пенополистирол (ПС)</option>
                  <option value="экструдированный пенополистирол">Экструдированный (ЭППС)</option>
                  <option value="пенополиуретан">Пенополиуретан (ППУ)</option>
                  <option value="эковата">Эковата</option>
                  <option value="пенофол">Пенофол</option>
                  <option value="другой">Другой</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Толщина утепления
                </label>
                <input
                  type="text"
                  value={editForm.insulationThickness || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, insulationThickness: e.target.value }))
                  }
                  placeholder="50мм, 100мм, 150мм..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип окон</label>
                <select
                  value={editForm.windows || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, windows: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="пластиковые">Пластиковые (ПВХ)</option>
                  <option value="деревянные">Деревянные</option>
                  <option value="деревянно-алюминиевые">Деревянно-алюминиевые</option>
                  <option value="другие">Другие</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип двери</label>
                <input
                  type="text"
                  value={editForm.doorType || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, doorType: e.target.value }))}
                  placeholder="Металлическая, деревянная..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Основание</label>
                <select
                  value={editForm.baseType || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, baseType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="ленточный">Ленточный</option>
                  <option value="свайный">Свайный</option>
                  <option value="плитный">Плитный</option>
                  <option value="столбчатый">Столбчатый</option>
                  <option value="свайно-винтовой">Свайно-винтовой</option>
                  <option value="другое">Другое</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип дома</label>
                <select
                  value={editForm.homeType || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, homeType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                  <option value="">Не выбрано</option>
                  <option value="круглогодичный">Круглогодичный</option>
                  <option value="сезонный">Сезонный</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип кровли</label>
              <select
                value={editForm.roofMaterial || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, roofMaterial: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]">
                <option value="">Не выбрано</option>
                <option value="металлочерепица">Металлочерепица</option>
                <option value="soft roof">Мягкая кровля (Soft Roof)</option>
                <option value="профнастил">Профнастил</option>
                <option value="ондулин">Ондулин</option>
                <option value="еврорубероид">Еврорубероид</option>
                <option value="деревянная">Деревянная</option>
                <option value="другая">Другая</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasMansard || false}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, hasMansard: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Мансарда</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasVeranda || false}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, hasVeranda: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Веранда</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.hasPorhch || false}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, hasPorhch: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#1976d2] focus:ring-[#1976d2]"
                />
                <span className="text-gray-700 font-medium">Крыльцо</span>
              </label>
            </div>

            {(editForm.hasVeranda || editForm.verandaSize) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Размер веранды
                </label>
                <input
                  type="text"
                  value={editForm.verandaSize || ''}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, verandaSize: e.target.value }))
                  }
                  placeholder="Например: 2x4 м"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2]"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Коммуникации</label>
              <textarea
                value={editForm.communication || ''}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, communication: e.target.value }))
                }
                placeholder="Газ, вода, электричество, канализация..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Планировка</label>
              <textarea
                value={editForm.layout || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, layout: e.target.value }))}
                placeholder="1 этаж: прихожая, кухня, гостиная...\n2 этаж: спальни, ванные..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Дополнительное описание объекта..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976d2] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-[#1976d2] hover:bg-[#1565c0] text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              Сохранить
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditForm({});
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors">
              Отмена
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBrigadeModal} onClose={() => setShowBrigadeModal(false)} title="Назначить бригаду" maxWidth="max-w-md">
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Выберите бригаду</label>
            <select
              value={selectedBrigadeId ?? ''}
              onChange={(e) => setSelectedBrigadeId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e24aa]">
              <option value="">Не выбрана</option>
              {brigades.map((brigade) => (
                <option key={brigade.id} value={brigade.id}>
                  {brigade.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowBrigadeModal(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold">
              Отмена
            </Button>
            <Button
              onClick={handleAssignBrigade}
              disabled={selectedBrigadeId == null}
              className="bg-[#8e24aa] hover:bg-[#7b1fa2] text-white font-semibold">
              Назначить
            </Button>
          </div>
        </div>
      </Modal>

      <TemplatePickerModal
        isOpen={showMaterialTemplatePicker}
        onClose={() => setShowMaterialTemplatePicker(false)}
        title="Выбрать шаблон материала"
        templates={materialTemplates}
        onSelect={addMaterialFromTemplate}
      />
      <TemplatePickerModal
        isOpen={showWorkTemplatePicker}
        onClose={() => setShowWorkTemplatePicker(false)}
        title="Выбрать шаблон работы"
        templates={workTemplates}
        onSelect={addWorkFromTemplate}
      />
      <TemplatePickerModal
        isOpen={showOverheadTemplatePicker}
        onClose={() => setShowOverheadTemplatePicker(false)}
        title="Выбрать шаблон расхода"
        templates={overheadTemplates}
        onSelect={addOverheadFromTemplate}
      />
    </div>
  );
}
