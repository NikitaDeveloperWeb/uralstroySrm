import { useState, useEffect, useCallback } from 'react';

interface Project {
  id: number;
  name: string;
  code: string;
}

interface FinancialPlan {
  id: number;
  projectId: number;
  periodFrom: string;
  periodTo: string;
  plannedAmount: number;
  comment: string | null;
  project: Project;
}

interface ProjectSummary {
  planId: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  plannedAmount: number;
  actualAmount: number;
  progress: number;
  comment: string | null;
}

interface SummaryResponse {
  periodFrom: string;
  periodTo: string;
  totalPlanned: number;
  totalActual: number;
  totalProgress: number;
  projects: ProjectSummary[];
}

export function useFinancialPlans(periodFrom: Date, periodTo: Date) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!periodFrom || !periodTo) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        periodFrom: periodFrom.toISOString(),
        periodTo: periodTo.toISOString(),
      });

      const response = await fetch(`/api/financial-plans/summary?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      setSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, [periodFrom, periodTo]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const createPlan = async (data: {
    projectId: number;
    periodFrom: Date;
    periodTo: Date;
    plannedAmount: number;
    comment?: string;
  }) => {
    try {
      const response = await fetch('/api/financial-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: data.projectId,
          periodFrom: data.periodFrom.toISOString(),
          periodTo: data.periodTo.toISOString(),
          plannedAmount: data.plannedAmount,
          comment: data.comment,
        }),
      });

      const result = await response.json();
      console.log('createPlan response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка создания');
      }

      await fetchSummary();
      return result.data;
    } catch (err) {
      console.error('createPlan error:', err);
      throw err;
    }
  };

  const updatePlan = async (id: number, data: {
    periodFrom?: Date;
    periodTo?: Date;
    plannedAmount?: number;
    comment?: string;
  }) => {
    try {
      const response = await fetch(`/api/financial-plans?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка обновления');
      }

      await fetchSummary();
      return result.data;
    } catch (err) {
      throw err;
    }
  };

  const deletePlan = async (id: number) => {
    try {
      const response = await fetch(`/api/financial-plans?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка удаления');
      }

      await fetchSummary();
    } catch (err) {
      throw err;
    }
  };

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
    createPlan,
    updatePlan,
    deletePlan,
  };
}
