import { Project } from './projects';
import { WarehouseItem } from './warehouse';

export interface Notification {
  id: number;
  type: 'overdue' | 'low-stock' | 'out-of-stock';
  message: string;
  priority: 'high' | 'medium';
  link?: string;
  date: string;
}

export function getNotifications(projects: Project[], items: WarehouseItem[]): Notification[] {
  const notifications: Notification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let id = 1;

  // Просроченные проекты
  for (const project of projects) {
    if (project.status === 'завершен') continue;
    const projectDate = new Date(project.date);
    projectDate.setHours(0, 0, 0, 0);
    if (projectDate < today) {
      notifications.push({
        id: id++,
        type: 'overdue',
        message: `Просрочена дата сдачи проекта «${project.name}»`,
        priority: 'high',
        link: `/projects/${project.id}`,
        date: project.date,
      });
    }
  }

  // Низкий остаток на складе
  for (const item of items) {
    if (item.status === 'нет в наличии') {
      notifications.push({
        id: id++,
        type: 'out-of-stock',
        message: `Нет в наличии: «${item.name}»`,
        priority: 'high',
        link: '/warehouse',
        date: item.lastUpdate,
      });
    } else if (item.status === 'критически мало') {
      notifications.push({
        id: id++,
        type: 'low-stock',
        message: `Критически мало: «${item.name}» (${item.quantity} ${item.unit})`,
        priority: 'medium',
        link: '/warehouse',
        date: item.lastUpdate,
      });
    }
  }

  // Сортировка: сначала high priority
  notifications.sort((a, b) => (a.priority === 'high' ? -1 : 1));

  return notifications;
}
