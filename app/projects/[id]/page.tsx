'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal';
import { EditableTable } from '@/shared/components/projects/EditableTable';
import { TemplatePickerModal } from '@/shared/components/projects/TemplatePickerModal';
import { TransactionTable } from '@/shared/components/projects/TransactionTable';
import { ProjectDetailHeader } from '@/shared/components/projects/ProjectDetailHeader';
import { ProjectDetailInfo } from '@/shared/components/projects/ProjectDetailInfo';
import { ProjectDetailLabor } from '@/shared/components/projects/ProjectDetailLabor';
import { ProjectObjectCard } from '@/shared/components/projects/ProjectObjectCard';
import { ProjectEstimateSection } from '@/shared/components/projects/ProjectEstimateSection';
import { ProjectOverheads } from '@/shared/components/projects/ProjectOverheads';
import { EditForm } from '@/shared/components/projects/EditForm';
import { ProjectObjectCardEditModal } from '@/shared/components/projects/ProjectObjectCardEditModal';
import { ReportModal } from '@/shared/components/projects/ReportModal';
import { WorkTable } from '@/shared/components/projects/WorkTable';
import { OverheadTable } from '@/shared/components/projects/OverheadTable';
import { getPaymentCategories } from '@/shared/components/projects/projectDetailUtils';
import { useProjectStore } from '@/shared/stores/projectStore';
import { useProjectTransactionStore } from '@/shared/stores/projectTransactionStore';
import { useProjectLaborStore } from '@/shared/stores/projectLaborStore';
import { useMaterialEstimateStore } from '@/shared/stores/materialEstimateStore';
import { CollapsibleSection } from '@/shared/components/projects/CollapsibleSection';
import { Pagination } from '@/shared/components/ui/Pagination';
import { useAlert } from '@/shared/hooks/useAlert';
import * as XLSX from 'xlsx';
import type { Project, Brigade } from '@/shared/types/project';

interface TemplateItem {
  id: number;
  name: string;
  cost: number;
  category?: string | null;
}

interface OverheadItem {
  id?: number;
  name: string;
  cost: number;
  category?: string | null;
}

function ObjectDetailPageInner() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const project = useProjectStore(useShallow((state) => state.projects.find((p) => p.id === id)));
  const fetchProjectDetail = useProjectStore((state) => state.fetchProjectDetail);
  const updateProject = useProjectStore((state) => state.updateProject);
  const materials = useProjectStore(useShallow((state) => state.materials));
  const completedWorks = useProjectStore(useShallow((state) => state.completedWorks));
  const materialTemplates = useProjectStore(useShallow((state) => state.materialTemplates));
  const workTemplates = useProjectStore(useShallow((state) => state.workTemplates));
  const workUnitRates = useProjectStore(useShallow((state) => state.workUnitRates));
  const fetchMaterialTemplates = useProjectStore((state) => state.fetchMaterialTemplates);
  const fetchWorkTemplates = useProjectStore((state) => state.fetchWorkTemplates);
  const fetchWorkUnitRates = useProjectStore((state) => state.fetchWorkUnitRates);
  const fetchProjectMaterials = useProjectStore((state) => state.fetchProjectMaterials);
  const fetchProjectCompletedWorks = useProjectStore((state) => state.fetchProjectCompletedWorks);

  const transactions = useProjectTransactionStore(useShallow((state) => state.transactions));
  const fetchTransactions = useProjectTransactionStore((state) => state.fetchTransactions);
  const createTransaction = useProjectTransactionStore((state) => state.createTransaction);
  const updateTransaction = useProjectTransactionStore((state) => state.updateTransaction);
  const deleteTransaction = useProjectTransactionStore((state) => state.deleteTransaction);

  const paymentStatuses = useProjectLaborStore(useShallow((state) => state.paymentStatuses));
  const togglePaymentStatus = useProjectLaborStore((state) => state.toggleStatus);
  const setStatuses = useProjectLaborStore((state) => state.setStatuses);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showObjectCardEditModal, setShowObjectCardEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showOverheadsModal, setShowOverheadsModal] = useState(false);
  const [showMaterialTemplatePicker, setShowMaterialTemplatePicker] = useState(false);
  const [showWorkTemplatePicker, setShowWorkTemplatePicker] = useState(false);
  const [showOverheadTemplatePicker, setShowOverheadTemplatePicker] = useState(false);
  const [showBrigadeModal, setShowBrigadeModal] = useState(false);
  const [selectedBrigadeId, setSelectedBrigadeId] = useState<number | undefined>();
  const [brigades, setBrigades] = useState<Brigade[]>([]);
  const [reports, setReports] = useState<{ id: number; date: string; periodFrom: string; periodTo: string; comment?: string | null }[]>([]);
  const [viewingReport, setViewingReport] = useState<{ id: number; date: string; periodFrom: string; periodTo: string; comment?: string | null } | null>(null);
  const [reportsPage, setReportsPage] = useState(1);
  const REPORTS_PER_PAGE = 10;
  const { confirm } = useAlert();
  const warehouseMaterials = useMaterialEstimateStore(state => state.materials);
  const fetchWarehouseMaterials = useMaterialEstimateStore(state => state.fetchMaterials);
  const materialsRef = useRef(materials);
  materialsRef.current = materials;

  // Ref для актуальных данных материалов (для сохранения)
  const materialsDataRef = useRef<any[]>([]);

  // Получение локальных данных из таблицы
  const handleMaterialsLocalData = useCallback((data: any[]) => {
    materialsDataRef.current = data;
  }, []);

  const [overheads, setOverheads] = useState<OverheadItem[]>([]);
  const [editOverheads, setEditOverheads] = useState<OverheadItem[]>([]);
  const [overheadTemplates, setOverheadTemplates] = useState<TemplateItem[]>([]);
  const [savingOverheads, setSavingOverheads] = useState(false);
  const [overheadEditIndex, setOverheadEditIndex] = useState<number | null>(null);

  // Ref для актуальных данных расходов
  const overheadsDataRef = useRef<OverheadItem[]>([]);

  // Мемоизированный editItems для таблицы расходов
  const overheadsEditItems = useMemo(() => {
    return editOverheads.length > 0 ? editOverheads : overheads;
  }, [editOverheads, overheads]);

  // Получение локальных данных из таблицы расходов
  const handleOverheadsLocalData = useCallback((data: OverheadItem[]) => {
    overheadsDataRef.current = data;
  }, []);

  const [materialsData, setMaterialsData] = useState<{id?: number; name: string; quantity: string; cost: number; category: string; stage?: string}[]>([] as any);
  const [materialsEditing, setMaterialsEditing] = useState(false);
  const [savingMaterials, setSavingMaterials] = useState(false);

  useEffect(() => {
    if (!materialsEditing) {
      setMaterialsData(materials.map((item) => ({
        id: item.id, name: item.name, quantity: item.quantity, cost: item.cost, category: item.category || '', stage: item.stage || '',
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialsEditing]);

  const [worksData, setWorksData] = useState<{id?: number; name: string; quantity: string; cost: number; category: string; stage?: string}[]>([] as any);
  const [worksEditing, setWorksEditing] = useState(false);
  const [savingWorks, setSavingWorks] = useState(false);
  const worksDataRef = useRef<any[]>([]);

  // Получение локальных данных из таблицы работ
  const handleWorksLocalData = useCallback((data: any[]) => {
    worksDataRef.current = data;
  }, []);

  useEffect(() => {
    if (!worksEditing) {
      setWorksData(completedWorks.map((item) => ({
        id: item.id, name: item.name, quantity: item.quantity, cost: item.cost, category: item.category || '', stage: item.stage || '',
      })));
    }
  }, [completedWorks, worksEditing]);

  // Обновляем refs при изменении данных
  useEffect(() => { materialsDataRef.current = materialsData; }, [materialsData]);
  useEffect(() => { worksDataRef.current = worksData; }, [worksData]);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    info: false,
    objectCard: false,
    estimate: false,
    labor: false,
    transactions: false,
    reports: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ─── Fetch ──────────────────────────────────────────────────────
  const fetchOverheads = async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/project-overheads?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        const list: OverheadItem[] = (data.data || []).map((h: any) => ({
          id: h.id, name: h.name, cost: h.cost, category: h.category,
        }));
        setOverheads(list);
      }
    } catch (e) {
      console.error('Failed to fetch overheads', e);
    }
  };

  // ─── Save ───────────────────────────────────────────────────────
  const saveOverheads = async () => {
    const items = overheadsDataRef.current;
    if (!project || items.length === 0) return;
    setSavingOverheads(true);
    try {
      for (const oh of items) {
        // Пропускаем пустые строки
        if (!oh.name && oh.cost === 0) continue;
        
        if (oh.id) {
          await fetch(`/api/project-overheads/${oh.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: oh.name, cost: oh.cost, category: oh.category || null }),
          }).catch(() => {});
        } else {
          await fetch('/api/project-overheads', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id, name: oh.name, cost: oh.cost, category: oh.category || null }),
          }).catch(() => {});
        }
      }
      for (const o of overheads) {
        if (!items.some((e) => e.id === o.id)) {
          await fetch(`/api/project-overheads/${o.id}`, { method: 'DELETE' }).catch(() => {});
        }
      }
      await fetchOverheads();
    } catch (error) {
      console.error('Ошибка сохранения расходов:', error);
    } finally {
      setSavingOverheads(false);
    }
  };

  const handleOverheadRowChange = useCallback((i: number, field: string, value: string | number | null | undefined) => {
    setEditOverheads(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  }, []);

  const handleOverheadRemoveRow = useCallback((i: number) => {
    setEditOverheads(prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const handleMaterialsSave = async () => {
    const currentMaterialsData = materialsDataRef.current;
    if (!project || currentMaterialsData.length === 0) {
      setMaterialsEditing(false); return;
    }
    setSavingMaterials(true);
    try {
      const currentMaterials = materialsRef.current;
      const existingIds = new Set(currentMaterials.map(m => m.id));
      
      // Сохраняем только непустые строки
      const validMaterials = currentMaterialsData.filter(m => m.name || m.quantity);
      
      for (const mat of validMaterials) {
        if (mat.id && existingIds.has(mat.id)) {
          await fetch(`/api/material-estimates/${mat.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: mat.name, quantity: mat.quantity, cost: mat.cost, category: mat.category || null, stage: mat.stage || null }),
          }).catch(() => {});
        } else if (!mat.id) {
          await fetch('/api/material-estimates', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id, name: mat.name, quantity: mat.quantity, cost: mat.cost, category: mat.category || null, stage: mat.stage || null }),
          }).catch(() => {});
        }
      }
      
      // Удаляем удалённые строки
      for (const cm of currentMaterials) {
        if (cm.id && !currentMaterialsData.some(m => m.id === cm.id)) {
          await fetch(`/api/material-estimates/${cm.id}`, { method: 'DELETE' }).catch(() => {});
        }
      }
      
      await fetchProjectMaterials(project.id);
      setMaterialsEditing(false);
    } catch (error) {
      console.error('Ошибка сохранения материалов:', error);
      setMaterialsEditing(false);
    } finally {
      setSavingMaterials(false);
    }
  };

  const handleWorkSave = async () => {
    if (!project) {
      setWorksEditing(false); return;
    }
    const currentWorksData = worksDataRef.current;
    setSavingWorks(true);
    try {
      const currentWorks = useProjectStore.getState().completedWorks;
      const currentIds = new Set(currentWorks.map(w => w.id));
      
      for (const work of currentWorksData) {
        // Пропускаем пустые строки
        if (!work.name && !work.quantity) continue;
        
        if (work.id) {
          await fetch(`/api/completed-works/${work.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: work.name, quantity: work.quantity, cost: work.cost, category: work.category || null, stage: work.stage || null }),
          }).catch(() => {});
        } else {
          await fetch('/api/completed-works', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: project.id, name: work.name, quantity: work.quantity, cost: work.cost, category: work.category || null, stage: work.stage || null }),
          }).catch(() => {});
        }
      }
      
      for (const cw of currentWorks) {
        if (cw.id && !currentWorksData.some(w => w.id === cw.id)) {
          await fetch(`/api/completed-works/${cw.id}`, { method: 'DELETE' }).catch(() => {});
        }
      }
      
      await fetchProjectCompletedWorks(project.id);
      setWorksEditing(false);
    } finally {
      setSavingWorks(false);
    }
  };

  // ─── Templates ─────────────────────────────────────────────────
  const handleApplyMaterial = async (material: { id: number; name: string; quantity: number; unit: string; price?: number; category: string }) => {
    if (!project) return;
    
    const cost = material.price || 0;
    const quantityStr = `${material.quantity} ${material.unit}`;
    
    try {
      const response = await fetch('/api/material-estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: material.name,
          quantity: quantityStr,
          cost: cost,
          category: material.category,
          stage: '',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const savedMaterial = data.data;
        
        const newItem = {
          id: savedMaterial.id,
          name: savedMaterial.name,
          quantity: savedMaterial.quantity,
          cost: savedMaterial.cost,
          category: savedMaterial.category || '',
          stage: savedMaterial.stage || '',
        };
        
        setMaterialsData(prev => [...prev, newItem]);
        await fetchProjectMaterials(project.id);
      }
    } catch (error) {
      console.error('Ошибка добавления материала:', error);
    }
  };

  const addMaterialFromTemplate = (template: { name: string; quantity?: string; cost: number; category?: string | null }) => {
    if (!project || !template.quantity) return;
    fetch('/api/material-estimates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, name: template.name, quantity: template.quantity, cost: template.cost }),
    }).then(() => fetchProjectMaterials(project.id)).catch(() => {});
  };

  const addWorkFromTemplate = (template: { name: string; quantity?: string; cost: number; category?: string | null }) => {
    if (!project || !template.quantity) return;
    fetch('/api/completed-works', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, name: template.name, quantity: template.quantity, cost: template.cost }),
    }).then(() => fetchProjectCompletedWorks(project.id)).catch(() => {});
  };

  const addWorkFromUnitRate = (template: { name: string; quantity?: string; cost: number; category?: string | null }) => {
    if (!project) return;
    fetch('/api/completed-works', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, name: template.name, quantity: template.quantity || 'м²', cost: template.cost }),
    }).then(() => fetchProjectCompletedWorks(project.id)).catch(() => {});
  };

  const handleWorkRowChange = useCallback((i: number, field: string, value: string | number) => {
    setWorksData(prev => {
      const copy = [...prev];
      if (field === 'work') {
        copy[i] = { ...copy[i], name: value as string };
      } else {
        copy[i] = { ...copy[i], [field]: value };
      }
      return copy;
    });
  }, []);

  const handleWorkRemoveRow = useCallback(async (i: number) => {
    const item = worksData[i];
    if (item?.id && project) {
      await fetch(`/api/completed-works/${item.id}`, { method: 'DELETE' }).catch(() => {});
      await fetchProjectCompletedWorks(project.id);
    }
    setWorksData(prev => prev.filter((_, idx) => idx !== i));
  }, [worksData, project, fetchProjectCompletedWorks]);

  const addOverheadFromTemplate = async (template: { name: string; cost: number; category?: string | null }) => {
    if (!project) return;
    const res = await fetch(`/api/project-overheads?projectId=${project.id}`);
    if (res.ok) {
      const data = await res.json();
      const exists = (data.data || []).some((h: any) => h.name === template.name);
      if (!exists) {
        await fetch('/api/project-overheads', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project.id, name: template.name, cost: template.cost, category: template.category || null }),
        }).catch(() => {});
        await fetchOverheads();
      }
    }
    setShowOverheadTemplatePicker(false);
  };

  // ─── Handlers ───────────────────────────────────────────────────
  const handleAssignBrigade = async () => {
    if (!project || selectedBrigadeId == null) return;
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brigadeId: selectedBrigadeId }),
      });
      setShowBrigadeModal(false);
      fetchProjectDetail(project.id);
    } catch (e) {
      console.error('Failed to assign brigade', e);
    }
  };

  const handleEdit = () => { if (project) { setEditForm({ ...project }); setShowEditModal(true); } };
  const handleSaveEdit = async (data: Partial<Project>) => { if (project) { await updateProject(project.id, data); setShowEditModal(false); setEditForm({}); } };
  const handleObjectCardSave = async (data: Partial<Project>) => { if (project) { await updateProject(project.id, data); setShowObjectCardEditModal(false); } };
  const handleStatusChange = async (status: string) => { if (project) { await updateProject(project.id, { status }); } };

  // ─── Effects ────────────────────────────────────────────────────
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (id && !project) {
      fetchProjectDetail(id);
    }
  }, [id, project, fetchProjectDetail]);

  useEffect(() => {
    if (!project) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    fetchProjectMaterials(id);
    fetchProjectCompletedWorks(id);
    fetchTransactions(id);
    fetchOverheads();
    fetchWarehouseMaterials();
    fetchReports();
    setSelectedBrigadeId(project.brigade?.id);
    const cats = getPaymentCategories(project.type);
    setStatuses(Array(cats.length).fill(null));
  }, [project]);

  // Обновляем ref при изменении materials
  useEffect(() => {
    materialsRef.current = materials;
  }, [materials]);

  useEffect(() => {
    useProjectStore.getState().fetchMaterialTemplates();
    useProjectStore.getState().fetchWorkTemplates();
    useProjectStore.getState().fetchWorkUnitRates();
    (async () => {
      try {
        const res = await fetch('/api/project-overhead-templates');
        if (res.ok) {
          const data = await res.json();
          setOverheadTemplates(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch overhead templates', e);
      }
      try {
        const res = await fetch('/api/brigades');
        if (res.ok) {
          const data = await res.json();
          setBrigades(data.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch brigades', e);
      }
    })();
  }, []);

  // ─── Callbacks ──────────────────────────────────────────────────
  const handleOpenMaterials = useCallback(() => {
    setShowMaterialsModal(true);
    const currentMaterials = materialsRef.current;
    setMaterialsData(currentMaterials.map((m) => ({
      id: m.id, name: m.name, quantity: m.quantity, cost: m.cost, category: m.category || '', stage: m.stage || '',
    })));
    setMaterialsEditing(false);
  }, []);

  const handleOpenWorks = useCallback(() => {
    setShowWorkModal(true);
    setWorksData(completedWorks.map((item) => ({
      id: item.id, name: item.name, quantity: item.quantity, cost: item.cost, category: item.category || '', stage: item.stage || '',
    })));
    setWorksEditing(false);
  }, [completedWorks]);

  const handleOpenOverheads = useCallback(() => {
    setShowOverheadsModal(true);
    fetchOverheads();
  }, []);

  const handleOpenBrigade = useCallback(() => {
    setSelectedBrigadeId(project?.brigade?.id);
    setShowBrigadeModal(true);
  }, [project]);

  const handleTransactionCreate = useCallback(async (data: any) => {
    await createTransaction({ projectId: id, ...data });
    await fetchTransactions(id);
  }, [id, createTransaction, fetchTransactions]);

  const handleTransactionUpdate = useCallback(async (tid: number, data: any) => {
    await updateTransaction(id, tid, data);
    await fetchTransactions(id);
  }, [id, updateTransaction, fetchTransactions]);

  const handleTransactionDelete = useCallback(async (tid: number) => {
    await deleteTransaction(id, tid);
    await fetchTransactions(id);
  }, [id, deleteTransaction, fetchTransactions]);

  const handleMaterialEdit = useCallback(() => {
    const currentMaterials = materialsRef.current;
    setMaterialsData(currentMaterials.map((m) => ({
      id: m.id, name: m.name, quantity: m.quantity, cost: m.cost, category: m.category || '',
    })));
    setMaterialsEditing(true);
  }, []);

  const handleMaterialAddRow = useCallback(() => {
    if (!project) return;
    const tempUid = Date.now();
    setMaterialsData(prev => [...prev, { id: undefined, _uid: tempUid, name: '', quantity: '', cost: 0, category: '', stage: '' }]);
  }, [project]);

  const handleMaterialCancel = useCallback(() => {
    setMaterialsEditing(false);
    setMaterialsData([]);
  }, []);

  const handleMaterialRemoveRow = useCallback(async (i: number) => {
    const item = materialsData[i];
    if (item?.id && project) {
      await fetch(`/api/material-estimates/${item.id}`, { method: 'DELETE' }).catch(() => {});
      await fetchProjectMaterials(project.id);
    }
    setMaterialsData(prev => prev.filter((_, idx) => idx !== i));
  }, [materialsData, project, fetchProjectMaterials]);

  const handleMaterialRowChange = useCallback((i: number, field: string, value: string | number) => {
    setMaterialsData(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  }, []);

  const handleWorkAddRow = useCallback(() => {
    if (!project) return;
    const tempUid = Date.now();
    setWorksData(prev => [...prev, { id: undefined, _uid: tempUid, name: '', quantity: '', cost: 0, category: '', stage: '' }]);
  }, [project]);

  const handleWorkEdit = useCallback(() => {
    setWorksData(completedWorks.map((item) => ({
      id: item.id, name: item.name, quantity: item.quantity, cost: item.cost, category: item.category || '',
    })));
    setWorksEditing(true);
  }, [completedWorks]);

  const handleOverheadAddRow = useCallback(() => {
    const tempUid = Date.now();
    setEditOverheads(prev => [...prev, { id: undefined, _uid: tempUid, name: '', cost: 0, category: null }]);
  }, []);

  const handleOverheadEdit = useCallback((i: number) => {
    setOverheadEditIndex(i);
    setEditOverheads(overheads.map((h) => ({ ...h })));
  }, [overheads]);

  const handleOverheadSave = useCallback(async () => {
    await saveOverheads();
    setOverheadEditIndex(null);
    setEditOverheads([]);
  }, [saveOverheads]);

  const handleOverheadCancel = useCallback(() => {
    setOverheadEditIndex(null);
    setEditOverheads([]);
  }, []);

  const handleTemplateDelete = useCallback(() => {
    fetch('/api/project-overhead-templates')
      .then((res) => res.json())
      .then((data) => setOverheadTemplates(data.data || []));
  }, []);

  const handleTemplateAdd = useCallback(() => {
    fetch('/api/project-overhead-templates')
      .then((res) => res.json())
      .then((data) => setOverheadTemplates(data.data || []));
  }, []);

  const handleWorkCancel = useCallback(() => {
    setWorksEditing(false);
    setWorksData([]);
  }, []);

  // ─── Excel Export ────────────────────────────────────────────────
  const handleExportMaterialsExcel = useCallback(() => {
    if (!materialsData || materialsData.length === 0) return;
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [['Смета материалов'], ['#', 'Наименование', 'Категория', 'Количество', 'Цена за ед.', 'Сумма']];
    let total = 0;
    materialsData.forEach((m, i) => {
      const qty = parseFloat(String(m.quantity).match(/[\d.]+/)?.[0] || '0');
      const price = m.cost || 0;
      const amount = Math.round(qty * price * 100) / 100;
      total += amount;
      rows.push([String(i + 1), m.name, m.category || '—', m.quantity, String(price), String(amount)]);
    });
    rows.push(['', 'Итого', '', '', '', String(total)]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Материалы');
    XLSX.writeFile(wb, 'смета_материалов_' + (project?.name || '') + '.xlsx');
  }, [materialsData, project]);

  const handleExportWorksExcel = useCallback(() => {
    if (!worksData || worksData.length === 0) return;
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [['Смета выполненных работ'], ['#', 'Наименование', 'Категория', 'Количество', 'Цена за ед.', 'Сумма']];
    let total = 0;
    worksData.forEach((w, i) => {
      const qty = parseFloat(String(w.quantity).match(/[\d.]+/)?.[0] || '0');
      const price = w.cost || 0;
      const amount = Math.round(qty * price * 100) / 100;
      total += amount;
      rows.push([String(i + 1), w.name, w.category || '—', w.quantity, String(price), String(amount)]);
    });
    rows.push(['', 'Итого', '', '', '', String(total)]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Работы');
    XLSX.writeFile(wb, 'смета_работ_' + (project?.name || '') + '.xlsx');
  }, [worksData, project]);

  const handleExportOverheadsExcel = useCallback(() => {
    if (!overheads || overheads.length === 0) return;
    const wb = XLSX.utils.book_new();
    const rows: string[][] = [['Общие расходы'], ['#', 'Наименование', 'Категория', 'Стоимость']];
    let total = 0;
    overheads.forEach((h, i) => {
      total += h.cost || 0;
      rows.push([String(i + 1), h.name, h.category || '—', String(h.cost)]);
    });
    rows.push(['', 'Итого', '', String(total)]);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Расходы');
    XLSX.writeFile(wb, 'расходы_' + (project?.name || '') + '.xlsx');
  }, [overheads, project]);

  const fetchReports = useCallback(async () => {
    if (!project) return;
    try {
      const res = await fetch(`/api/project-reports?projectId=${project.id}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.data || []);
      }
    } catch (e) {
      console.error('Ошибка загрузки отчетов:', e);
    }
  }, [project]);

  const reportsTotalPages = Math.ceil(reports.length / REPORTS_PER_PAGE) || 1;
  const paginatedReports = reports.slice(
    (reportsPage - 1) * REPORTS_PER_PAGE,
    reportsPage * REPORTS_PER_PAGE,
  );

  const handleDeleteReport = async (reportId: number) => {
    if (!(await confirm('Удалить отчет?'))) return;
    try {
      await fetch(`/api/project-reports/${reportId}`, { method: 'DELETE' });
      await fetchReports();
    } catch (e) {
      console.error('Ошибка удаления отчета:', e);
    }
  };

  const handleOverheadModalClose = useCallback(() => {
    setShowOverheadsModal(false);
    setOverheadEditIndex(null);
    setEditOverheads([]);
  }, []);

  const handleMaterialsModalClose = useCallback(() => {
    setShowMaterialsModal(false);
    setMaterialsEditing(false);
    setMaterialsData([]);
  }, []);

  const handleWorkTemplatePickerOpen = useCallback(() => {
    setShowWorkTemplatePicker(true);
  }, []);

  const handleOverheadTemplatePickerOpen = useCallback(() => {
    setShowOverheadTemplatePicker(true);
  }, []);

  // ─── Derived ────────────────────────────────────────────────────
  const brigadeOptions = useMemo(() => (
    brigades.map((b) => (
      <option key={b.id} value={b.id}>{b.name}</option>
    ))
  ), [brigades]);

  const router = useRouter();
  if (!project) {
    useEffect(() => {
      router.push('/projects');
    }, [router]);
    return null;
  }

  const projectCost = parseInt(String(project.cost));
  const categories = getPaymentCategories(project.type);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <ProjectDetailHeader project={project} onEdit={handleEdit} onStatusChange={handleStatusChange} />
      
      <CollapsibleSection
        title="Информация об объекте"
        icon="📊"
        collapsed={collapsedSections.info}
        onToggle={() => toggleSection('info')}
        className="mt-6"
      >
        <ProjectDetailInfo project={project} />
        
        {/* Карта по адресу */}
        {project.address && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">📍 Карта</h3>
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
              <iframe
                width="100%"
                height="350"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(project.address)}`}
                title={`Карта: ${project.address}`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{project.address}</p>
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="Карта объекта"
        icon="🏗"
        collapsed={collapsedSections.objectCard}
        onToggle={() => toggleSection('objectCard')}
        className="mt-6"
      >
        <ProjectObjectCard
          project={project}
          collapsed={false}
          onToggle={() => {}}
          onEdit={() => { setEditForm(project); setShowObjectCardEditModal(true); }}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Смета и ресурсы"
        icon="📋"
        collapsed={collapsedSections.estimate}
        onToggle={() => toggleSection('estimate')}
        className="mt-6"
      >
        <ProjectEstimateSection
          onOpenMaterials={handleOpenMaterials}
          onOpenWorks={handleOpenWorks}
          onOpenOverheads={handleOpenOverheads}
          onOpenBrigade={handleOpenBrigade}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Оплата труда"
        icon="💼"
        collapsed={collapsedSections.labor}
        onToggle={() => toggleSection('labor')}
        className="mt-6"
      >
        <ProjectDetailLabor categories={categories} projectCost={projectCost} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Финансовые транзакции"
        icon="💳"
        collapsed={collapsedSections.transactions}
        onToggle={() => toggleSection('transactions')}
        className="mt-6"
      >
        <TransactionTable
          transactions={transactions}
          projectCost={projectCost}
          loading={useProjectTransactionStore.getState().loading}
          error={useProjectTransactionStore.getState().error}
          onCreate={handleTransactionCreate}
          onUpdate={handleTransactionUpdate}
          onDelete={handleTransactionDelete}
        />
      </CollapsibleSection>

      {/* ─── Modals ─────────────────────────────────────��───────── */}
      <Modal
        isOpen={showMaterialsModal}
        onClose={handleMaterialsModalClose}
        title="Смета материалов"
        maxWidth="max-w-[80vw]" maxHeight="max-h-[70vh]"
      >
        <EditableTable
          items={materialsData} editItems={materialsData} editIndex={materialsEditing ? 0 : null}
          title="Материал" itemName="name"
          onExportExcel={handleExportMaterialsExcel}
          useWarehousePicker
          onAddRow={handleMaterialAddRow}
          onEdit={handleMaterialEdit}
          onSave={handleMaterialsSave}
          onCancel={handleMaterialCancel}
          onRemoveRow={handleMaterialRemoveRow}
          onRowChange={handleMaterialRowChange}
          isSaving={savingMaterials}
          materials={warehouseMaterials}
          onApplyMaterial={handleApplyMaterial}
          getLocalData={handleMaterialsLocalData}
        />
      </Modal>

      <Modal
        isOpen={showWorkModal}
        onClose={() => { setShowWorkModal(false); setWorksEditing(false); setWorksData([]); }}
        title="Смета выполненных работ"
        maxWidth="max-w-[80vw]" maxHeight="max-h-[70vh]"
      >
        <WorkTable
          items={worksData.map(w => ({ ...w, work: w.name }))} editItems={worksData.map(w => ({ ...w, work: w.name }))} editIndex={worksEditing ? 0 : null}
          onExportExcel={handleExportWorksExcel}
          onOpenTemplate={handleWorkTemplatePickerOpen}
          onAddRow={handleWorkAddRow}
          onEdit={handleWorkEdit}
          onSave={handleWorkSave}
          onCancel={handleWorkCancel}
          onRemoveRow={handleWorkRemoveRow}
          onRowChange={handleWorkRowChange}
          isSaving={savingWorks}
          getLocalData={handleWorksLocalData}
        />
      </Modal>

      <Modal
        isOpen={showOverheadsModal}
        onClose={() => { setShowOverheadsModal(false); setOverheadEditIndex(null); setEditOverheads([]); }}
        title="Общие расходы"
        maxWidth="max-w-[80vw]" maxHeight="max-h-[70vh]"
      >
        <OverheadTable
          items={overheads}
          editItems={overheadsEditItems}
          editIndex={overheadEditIndex}
          onExportExcel={handleExportOverheadsExcel}
          onOpenTemplate={handleOverheadTemplatePickerOpen}
          onAddRow={handleOverheadAddRow}
          onEdit={handleOverheadEdit}
          onSave={handleOverheadSave}
          onCancel={handleOverheadCancel}
          onRemoveRow={handleOverheadRemoveRow}
          onRowChange={handleOverheadRowChange}
          isSaving={savingOverheads}
          getLocalData={handleOverheadsLocalData}
        />
      </Modal>

      <Button onClick={() => setShowReportModal(true)} className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold px-12 py-3 text-lg rounded-lg shadow-md">
        📝 Создать отчет
      </Button>

      {/* Список отчетов */}
      {reports.length > 0 && (
        <CollapsibleSection
          title="📄 Отчеты"
          icon="📄"
          collapsed={collapsedSections.reports}
          onToggle={() => toggleSection('reports')}
          className="mt-6"
        >
          <div className="space-y-2">
            {paginatedReports.map(report => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 dark:bg-blue-900/40 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-400 dark:text-blue-400">#{report.id}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white dark:text-white">
                      {new Date(report.date).toLocaleDateString('ru-RU')}
                    </p>
                    {report.comment && <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400">{report.comment}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setViewingReport(report);
                      setShowReportModal(true);
                    }}
                    className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/40 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 dark:hover:bg-blue-800 transition-colors"
                  >
                    Просмотр
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.id)}
                    className="p-1.5 text-gray-400 dark:text-slate-500 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={reportsPage}
            totalPages={reportsTotalPages}
            onPageChange={setReportsPage}
            totalItems={reports.length}
            itemsPerPage={REPORTS_PER_PAGE}
          />
        </CollapsibleSection>
      )}

      <EditForm project={project} editForm={editForm} setEditForm={setEditForm} isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditForm({}); }} onSave={handleSaveEdit} />

      <ProjectObjectCardEditModal isOpen={showObjectCardEditModal} onClose={() => setShowObjectCardEditModal(false)} editForm={editForm} setEditForm={setEditForm} onSave={handleObjectCardSave} />


      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        project={project}
        materials={materials}
        completedWorks={completedWorks}
        overheads={overheads}
        maxWidth="max-w-[80vw]"
        maxHeight="max-h-[80vh]"
      />

      <Modal isOpen={showBrigadeModal} onClose={() => setShowBrigadeModal(false)} title="Назначить бригаду" maxWidth="max-w-md">
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 dark:text-slate-300 mb-1">Выберите бригаду</label>
            <select
              value={selectedBrigadeId ?? ''}
              onChange={(e) => setSelectedBrigadeId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8e24aa]"
            >
              <option value="">Не выбрана</option>
              {brigadeOptions}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowBrigadeModal(false)} className="bg-gray-200 dark:bg-slate-700 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-600 dark:bg-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 font-semibold">Отмена</Button>
            <Button onClick={handleAssignBrigade} disabled={selectedBrigadeId == null} className="bg-[#8e24aa] hover:bg-[#7b1fa2] text-white font-semibold">Назначить</Button>
          </div>
        </div>
      </Modal>

      <TemplatePickerModal isOpen={showMaterialTemplatePicker} onClose={() => setShowMaterialTemplatePicker(false)} title="Выбрать шаблон материала" templates={materialTemplates} onSelect={addMaterialFromTemplate} />
      <TemplatePickerModal
        isOpen={showWorkTemplatePicker}
        onClose={() => setShowWorkTemplatePicker(false)}
        title="Выбрать вид работы"
        templates={workUnitRates}
        onSelect={addWorkFromUnitRate}
        onDelete={() => useProjectStore.getState().fetchWorkUnitRates()}
      />
      <TemplatePickerModal
        isOpen={showOverheadTemplatePicker}
        onClose={() => setShowOverheadTemplatePicker(false)}
        title="Выбрать шаблон расхода"
        templates={overheadTemplates}
        onSelect={addOverheadFromTemplate}
        onDelete={handleTemplateDelete}
        onAdd={handleTemplateAdd}
        type="overhead"
      />
    </div>
  );
}

export default function ObjectDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const router = useRouter();

  // Redirect to projects list if id is invalid
  if (isNaN(id) || id <= 0) {
    useEffect(() => {
      router.push('/projects');
    }, [router]);
    return null;
  }

  return (
    <ObjectDetailPageInner key={id} />
  );
}
