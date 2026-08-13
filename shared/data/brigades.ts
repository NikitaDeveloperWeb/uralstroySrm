export interface Brigade {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
  skills: string[];
}

export const initialBrigades: Brigade[] = [
  { id: 1, name: 'Бригада «Строй»', leaderId: 1, memberIds: [2, 4], skills: ['сварщик', 'монтажник', 'каменщик'] },
  { id: 2, name: 'Бригада «Монтаж»', leaderId: 6, memberIds: [3, 5], skills: ['плотник', 'бетонщик', 'штукатур'] },
  { id: 3, name: 'Бригада «Универсал»', leaderId: 7, memberIds: [8], skills: ['строитель-универсал', 'сантехник', 'электрик'] },
  { id: 4, name: 'Бригада «Кровля»', leaderId: 9, memberIds: [10, 11], skills: ['кровельщик', 'сварщик', 'монтажник'] },
  { id: 5, name: 'Бригада «Фасад»', leaderId: 12, memberIds: [13, 14], skills: ['маляр', 'штукатур', 'каменщик'] },
];

export const skillColors: Record<string, string> = {
  'сварщик': 'bg-yellow-100 text-yellow-800',
  'каменщик': 'bg-amber-100 text-amber-800',
  'плотник': 'bg-orange-100 text-orange-800',
  'монтажник': 'bg-purple-100 text-purple-800',
  'электрик': 'bg-cyan-100 text-cyan-800',
  'сантехник': 'bg-blue-100 text-blue-800',
  'маляр': 'bg-pink-100 text-pink-800',
  'штукатур': 'bg-lime-100 text-lime-800',
  'крановщик': 'bg-red-100 text-red-800',
  'бетонщик': 'bg-gray-100 text-gray-800',
  'гибочик металла': 'bg-indigo-100 text-indigo-800',
  'строитель-универсал': 'bg-teal-100 text-teal-800',
  'кровельщик': 'bg-rose-100 text-rose-800',
};
