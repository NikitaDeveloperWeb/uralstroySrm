// ============================================================
// Утилиты для ProjectDetail
// ============================================================

export function parseJsonSafe<T>(value: unknown): T {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value as T;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('ru-RU');
}

export function formatPercent(part: number, total: number, digits = 1): string {
  if (!total) return '0';
  return `${Math.round((part / total) * 100).toFixed(digits)}%`;
}

export const TYPE_ICONS: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};

export const STATUS_COLORS: Record<string, string> = {
  создан: 'bg-gray-500',
  'в работе': 'bg-blue-500',
  завершен: 'bg-green-500',
};

export const COMPLEXITY_COLORS: Record<string, string> = {
  легкий: 'bg-green-500',
  средний: 'bg-yellow-500',
  сложный: 'bg-red-500',
};

export const PAYMENT_CATEGORIES = [
  { name: 'Цех', percentage: 5 },
  { name: 'Монтажники', percentage: 5 },
  { name: 'Премия цеха', percentage: 2.5 },
  { name: 'Премия монтажников', percentage: 2.5 },
];

export const MANAGER_PERCENTAGE = 5;

export const MATERIALS_BREAKDOWN = [
  { label: 'Каркасы', qtyMultiplier: 0.1, perM2: 2778 },
  { label: 'Липа', qtyMultiplier: 0.2, perM2: 1889 },
  { label: 'Сосна', qtyMultiplier: 0.5, perM2: 2111 },
  { label: 'Утеплитель', qtyMultiplier: 0.3, perM2: 1000 },
  { label: 'Стропила', qtyMultiplier: 0.4, perM2: 1200 },
];

export const STATUS_OPTIONS = ['создан', 'в работе', 'завершен'] as const;
export const COMPLEXITY_OPTIONS = ['легкий', 'средний', 'сложный'] as const;

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
