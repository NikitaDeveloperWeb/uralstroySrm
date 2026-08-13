export interface WarehouseItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  lastUpdate: string;
  status: string;
}

export const initialWarehouseItems: WarehouseItem[] = [
  { id: 1, name: 'Кирпич красный М150', category: 'кирпич', quantity: 5000, unit: 'шт', location: 'Склад А, секция 1', lastUpdate: '2025-07-28', status: 'достаточно' },
  { id: 2, name: 'Цемент М500', category: 'цемент', quantity: 200, unit: 'кг', location: 'Склад Б, секция 3', lastUpdate: '2025-07-25', status: 'мало' },
  { id: 3, name: 'Доска обрезная 50x150x6000', category: 'дерево', quantity: 30, unit: 'м³', location: 'Склад В, секция 2', lastUpdate: '2025-07-20', status: 'достаточно' },
  { id: 4, name: 'Арматура А500С 12мм', category: 'металл', quantity: 0, unit: 'м²', location: 'Склад Г, секция 1', lastUpdate: '2025-07-15', status: 'нет в наличии' },
  { id: 5, name: 'Перфоратор Bosch GBH 2-26', category: 'инструменты', quantity: 3, unit: 'комплект', location: 'Склад А, секция 5', lastUpdate: '2025-07-29', status: 'критически мало' },
  { id: 6, name: 'Кирпич облицовочный', category: 'кирпич', quantity: 150, unit: 'шт', location: 'Склад А, секция 2', lastUpdate: '2025-07-27', status: 'мало' },
  { id: 7, name: 'Песок строительный', category: 'другие', quantity: 10, unit: 'м³', location: 'Склад Д, секция 1', lastUpdate: '2025-07-26', status: 'достаточно' },
  { id: 8, name: 'Профнастил С8', category: 'металл', quantity: 5, unit: 'м²', location: 'Склад Г, секция 3', lastUpdate: '2025-07-22', status: 'критически мало' },
  { id: 9, name: 'Пенополистирол 50мм', category: 'утеплители', quantity: 100, unit: 'м²', location: 'Склад Б, секция 1', lastUpdate: '2025-07-30', status: 'достаточно' },
  { id: 10, name: 'Мембрана гидроизоляция', category: 'гидроизоляция', quantity: 500, unit: 'м²', location: 'Склад Б, секция 2', lastUpdate: '2025-07-28', status: 'достаточно' },
  { id: 11, name: 'Саморезы кровельные', category: 'крепёж', quantity: 5000, unit: 'шт', location: 'Склад А, секция 3', lastUpdate: '2025-07-29', status: 'достаточно' },
  { id: 12, name: 'Гибка металла 0.5мм', category: 'металл', quantity: 8, unit: 'т', location: 'Склад Г, секция 2', lastUpdate: '2025-07-25', status: 'достаточно' },
];
