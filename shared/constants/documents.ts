export const CATEGORIES = [
  { value: 'contracts', label: 'Договоры', icon: '📄' },
  { value: 'reports', label: 'Отчеты', icon: '📊' },
  { value: 'schedules', label: 'Графики', icon: '📅' },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  contracts: 'Договоры',
  reports: 'Отчеты',
  schedules: 'Графики',
};

export const CATEGORY_COLORS: Record<string, string> = {
  contracts: 'text-blue-600 bg-blue-50',
  reports: 'text-green-600 bg-green-50',
  schedules: 'text-purple-600 bg-purple-50',
};

export type Category = (typeof CATEGORIES)[number]['value'];
