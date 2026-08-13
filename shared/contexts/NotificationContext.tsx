'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Notification, getNotifications } from '@/shared/data/notifications';
import { initialProjects } from '@/shared/data/projects';
import { initialWarehouseItems } from '@/shared/data/warehouse';

export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationCategory = 'overdue' | 'low-stock' | 'out-of-stock' | 'finance' | 'schedule' | 'system';

export interface ExtendedNotification extends Notification {
  status: NotificationStatus;
  category: NotificationCategory;
  createdAt: string;
  readAt?: string;
}

interface NotificationState {
  notifications: ExtendedNotification[];
  unreadCount: number;
  isVisible: boolean;
  isOpen: boolean;
  filters: {
    priority: 'all' | 'high' | 'medium' | 'low';
    status: 'all' | 'unread' | 'read' | 'archived';
    category: NotificationCategory | 'all';
  };
}

interface NotificationContextType extends NotificationState {
  toggleOpen: () => void;
  closeOpen: () => void;
  markAsRead: (id: number) => void;
  markAsUnread: (id: number) => void;
  archive: (id: number) => void;
  restore: (id: number) => void;
  deleteNotification: (id: number) => void;
  markAllAsRead: () => void;
  clearArchived: () => void;
  refreshNotifications: () => void;
  setFilters: (filters: Partial<NotificationContextType['filters']>) => void;
  getNotificationsByCategory: (category: NotificationCategory) => ExtendedNotification[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
}

export function useNotifications() {
  return useNotificationContext();
}

const categoryMap: Record<Notification['type'], NotificationCategory> = {
  overdue: 'overdue',
  'low-stock': 'low-stock',
  'out-of-stock': 'out-of-stock',
};

function convertToExtendedNotification(notification: Notification, index: number): ExtendedNotification {
  const category = categoryMap[notification.type] || 'system';
  return {
    ...notification,
    status: 'unread',
    category,
    createdAt: notification.date,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isVisible: false,
    isOpen: false,
    filters: {
      priority: 'all',
      status: 'all',
      category: 'all',
    },
  });

    const loadNotifications = useCallback(() => {
    const systemNotifications = getNotifications(initialProjects, initialWarehouseItems);
    const extendedNotifications = systemNotifications.map((n, i) => convertToExtendedNotification(n, i));
    
    setState(prev => ({
      ...prev,
      notifications: extendedNotifications,
      unreadCount: extendedNotifications.filter(n => n.status === 'unread').length,
      isVisible: extendedNotifications.some(n => n.priority === 'high' && n.status === 'unread'),
    }));
  }, []);

  const toggleOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const closeOpen = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Автоматическое обновление каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Сброс unread при переходе на страницу из уведомления
  useEffect(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.link === pathname && n.status === 'unread'
          ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
          : n
      ),
      unreadCount: prev.notifications.filter(n => n.link === pathname && n.status === 'unread').length,
    }));
  }, [pathname]);

  const markAsRead = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n
      ),
      unreadCount: prev.unreadCount - 1,
    }));
  }, []);

  const markAsUnread = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, status: 'unread' as const, readAt: undefined } : n
      ),
      unreadCount: prev.unreadCount + 1,
    }));
  }, []);

  const archive = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id ? { ...n, status: 'archived' as const } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - (prev.notifications.find(n => n.id === id)?.status === 'unread' ? 1 : 0)),
    }));
  }, []);

  const restore = useCallback((id: number) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.id === id && n.status === 'read'
          ? { ...n, status: 'read' as const }
          : n.id === id
          ? { ...n, status: 'unread' as const }
          : n
      ),
      unreadCount:
        prev.notifications.find(n => n.id === id)?.status === 'unread'
          ? prev.unreadCount + 1
          : prev.unreadCount,
    }));
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setState(prev => {
      const notification = prev.notifications.find(n => n.id === id);
      return {
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id),
        unreadCount: notification?.status === 'unread' ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
      };
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n =>
        n.status !== 'archived' ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n
      ),
      unreadCount: 0,
    }));
  }, []);

  const clearArchived = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.status !== 'archived'),
      unreadCount: prev.unreadCount,
    }));
  }, []);

  const refreshNotifications = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const setFilters = useCallback((filters: Partial<NotificationContextType['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
    }));
  }, []);

  const getNotificationsByCategory = useCallback(
    (category: NotificationCategory) => {
      return state.notifications.filter(n => n.category === category);
    },
    [state.notifications]
  );

  const filteredNotifications = state.notifications.filter(n => {
    if (state.filters.priority !== 'all' && n.priority !== state.filters.priority) return false;
    if (state.filters.status !== 'all' && n.status !== state.filters.status) return false;
    if (state.filters.category !== 'all' && n.category !== state.filters.category) return false;
    return true;
  });

  const contextValue: NotificationContextType = {
    ...state,
    notifications: filteredNotifications,
    isOpen: state.isOpen,
    toggleOpen,
    closeOpen,
    markAsRead,
    markAsUnread,
    archive,
    restore,
    deleteNotification,
    markAllAsRead,
    clearArchived,
    refreshNotifications,
    setFilters,
    getNotificationsByCategory,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
