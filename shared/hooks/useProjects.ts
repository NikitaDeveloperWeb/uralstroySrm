import { useEffect } from 'react';
import { useProjectStore } from '@/shared/stores/projectStore';

export function useProjects() {
  const { fetchProjects, fetchBrigades } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
    fetchBrigades();
  }, [fetchProjects, fetchBrigades]);
  
  return useProjectStore();
}

export function useProjectDetail(id: number) {
  const { fetchProjectDetail, fetchProjectMaterials, fetchProjectCompletedWorks } = useProjectStore();
  
  useEffect(() => {
    fetchProjectDetail(id);
    fetchProjectMaterials(id);
    fetchProjectCompletedWorks(id);
  }, [id, fetchProjectDetail, fetchProjectMaterials, fetchProjectCompletedWorks]);
  
  return useProjectStore();
}

export function useBrigades() {
  const { fetchBrigades } = useProjectStore();
  
  useEffect(() => {
    fetchBrigades();
  }, [fetchBrigades]);
  
  return useProjectStore();
}
