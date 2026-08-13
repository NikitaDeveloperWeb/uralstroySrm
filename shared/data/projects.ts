export interface Project {
  id: number;
  name: string;
  area: string;
  address: string;
  type: string;
  cost: string;
  date: string;
  complexity: string;
  status: string;
  code: string;
  brigadeId: number | null;
}

export const initialProjects: Project[] = [
  { id: 1, name: 'Баня Ивана', area: '45', address: 'ул. Ленина, 12', type: 'баня', cost: '500000', date: '2026-08-15', complexity: 'средний', status: 'в работе', code: '2807202601', brigadeId: 1 },
  { id: 2, name: 'Дом Петров', area: '120', address: 'ул. Мира, 45', type: 'дом', cost: '2000000', date: '2026-09-30', complexity: 'сложный', status: 'в работе', code: '2807202602', brigadeId: 2 },
  { id: 3, name: 'Хозблок Сидоров', area: '18', address: 'ул. Садовая, 7', type: 'хозблок', cost: '150000', date: '2026-10-15', complexity: 'легкий', status: 'создан', code: '2807202603', brigadeId: null },
  { id: 4, name: 'Веранда у дома', area: '32', address: 'ул. Центральная, 19', type: 'веранда', cost: '350000', date: '2026-07-20', complexity: 'средний', status: 'в работе', code: '2807202604', brigadeId: 4 },
  { id: 5, name: 'Туалет на участке', area: '8', address: 'ул. Полевая, 3', type: 'туалет', cost: '80000', date: '2026-11-30', complexity: 'легкий', status: 'создан', code: '2807202605', brigadeId: null },
  { id: 6, name: 'Дом Смирновых', area: '150', address: 'ул. Зеленая, 25', type: 'дом', cost: '2500000', date: '2026-12-31', complexity: 'сложный', status: 'создан', code: '2807202606', brigadeId: null },
  { id: 7, name: 'Баня на берегу', area: '60', address: 'озерная ул., 5', type: 'баня', cost: '800000', date: '2026-06-15', complexity: 'средний', status: 'в работе', code: '2807202607', brigadeId: 1 },
  { id: 8, name: 'Коттедж в лесу', area: '200', address: 'ул. Лесная, 10', type: 'дом', cost: '4500000', date: '2027-03-15', complexity: 'сложный', status: 'создан', code: '2807202608', brigadeId: null },
  { id: 9, name: 'Гараж на 2 авто', area: '40', address: 'ул. Промышленная, 8', type: 'хозблок', cost: '400000', date: '2026-08-30', complexity: 'легкий', status: 'в работе', code: '2807202609', brigadeId: 3 },
  { id: 10, name: 'Беседка садовая', area: '25', address: 'паркCentral, 3', type: 'веранда', cost: '250000', date: '2026-07-10', complexity: 'легкий', status: 'в работе', code: '2807202610', brigadeId: 5 },
  { id: 11, name: 'Таунхаус «Сосны»', area: '180', address: 'ул. Сосновая, 12', type: 'дом', cost: '3800000', date: '2027-06-30', complexity: 'сложный', status: 'создан', code: '2807202611', brigadeId: null },
  { id: 12, name: 'Летняя кухня', area: '35', address: 'ул. Садовая, 15', type: 'баня', cost: '450000', date: '2026-09-15', complexity: 'средний', status: 'создан', code: '2807202612', brigadeId: null },
];

export const statusColors: Record<string, string> = {
  создан: 'bg-gray-500',
  'в работе': 'bg-blue-500',
  завершен: 'bg-green-500',
};

export const typeIcons: Record<string, string> = {
  дом: '🏠',
  баня: '🧖',
  туалет: '🚽',
  хозблок: '🏗',
  веранда: '🏡',
};
