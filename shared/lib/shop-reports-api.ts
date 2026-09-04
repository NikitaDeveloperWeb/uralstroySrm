const API_BASE = '/api';

export async function fetchShopReports(params?: { employeeId?: number; projectId?: number }) {
  const url = new URL(`${API_BASE}/shop-reports`, window.location.origin);
  if (params?.employeeId) url.searchParams.set('employeeId', String(params.employeeId));
  if (params?.projectId) url.searchParams.set('projectId', String(params.projectId));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Не удалось загрузить отчеты');
  const data = await res.json();
  return data.data;
}

export async function createShopReport(data: {
  employeeId: number;
  projectId?: number;
  date: string;
  periodFrom: string;
  periodTo: string;
  comment?: string;
  items: Array<{
    workTypeId?: number;
    workName: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}) {
  const res = await fetch(`${API_BASE}/shop-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Не удалось сохранить отчет');
  }
  const result = await res.json();
  return result.data;
}

export async function fetchEmployeesWithSdelnaya() {
  const res = await fetch(`${API_BASE}/employees`);
  if (!res.ok) throw new Error('Не удалось загрузить сотрудников');
  const data = await res.json();
  // Фильтруем только с сдельной оплатой
  return data.data.filter((e: any) => 
    e.paymentType?.toLowerCase().includes('сдель')
  );
}

export async function fetchUnitRatesForEmployee() {
  const res = await fetch(`${API_BASE}/unit-rates?targetType=employee`);
  if (!res.ok) throw new Error('Не удалось загрузить расценки');
  const data = await res.json();
  return data.data;
}

// EOT (ЕОТ) API
export async function fetchEOTReports(params?: { date?: string; employeeId?: number }) {
  const paramsStr = new URLSearchParams();
  if (params?.date) paramsStr.set('date', params.date);
  if (params?.employeeId) paramsStr.set('employeeId', String(params.employeeId));
  const query = paramsStr.toString();
  const url = query ? `${API_BASE}/eot-reports?${query}` : `${API_BASE}/eot-reports`;

  const res = await fetch(url);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Не удалось загрузить ЕОТ');
  }
  const data = await res.json();
  return data.data;
}

export async function generateEOTReport(date: string) {
  const res = await fetch(`${API_BASE}/eot-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Не удалось создать ЕОТ');
  }
  const result = await res.json();
  return result.data;
}
