/**
 * Unified API client for all stores
 * Replaces duplicated apiFetch in 8+ store files
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: unknown;
}

export interface ApiError extends Error {
  status?: number;
}

export async function apiFetch<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error: ApiError = new Error(body.error || `API error: ${res.status}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export function createQueryUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params || Object.keys(params).length === 0) return base;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, String(v));
    }
  });
  return `${base}?${query}`;
}
