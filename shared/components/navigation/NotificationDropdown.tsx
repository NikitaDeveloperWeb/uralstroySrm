'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  PackageX,
  Archive,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useNotifications, ExtendedNotification } from '@/shared/contexts/NotificationContext';
import { Button } from '@/shared/components/ui/button';

const categoryLabels: Record<string, string> = {
  overdue: 'Просроченные',
  'low-stock': 'Склад',
  'out-of-stock': 'Нет в наличии',
  finance: 'Финансы',
  schedule: 'График',
  system: 'Система',
};

const priorityLabels: Record<string, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isVisible,
    markAsRead,
    markAsUnread,
    archive,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
    setFilters,
    filters,
  } = useNotifications();

  const [showFilters, setShowFilters] = useState(false);

  const getNotificationIcon = (type: ExtendedNotification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'low-stock':
        return <PackageX className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
      case 'out-of-stock':
        return <Archive className="w-5 h-5 text-orange-600 flex-shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300 flex-shrink-0" />;
    }
  };

  const getPriorityColor = (priority: ExtendedNotification['priority']) => {
    return priority === 'high' ? 'border-l-red-500' : 'border-l-yellow-500';
  };

  const getStatusBadge = (status: ExtendedNotification['status']) => {
    switch (status) {
      case 'unread':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Новый
          </span>
        );
      case 'read':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200">
            Прочитан
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Архив
          </span>
        );
    }
  };

  const handleNotificationClick = (notification: ExtendedNotification) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filters.category !== 'all' && n.category !== filters.category) return false;
    if (filters.priority !== 'all' && n.priority !== filters.priority) return false;
    if (filters.status !== 'all' && n.status !== filters.status) return false;
    return true;
  });

  const hasActiveFilters = filters.category !== 'all' || filters.priority !== 'all' || filters.status !== 'all';

  const clearFilters = () => {
    setFilters({ category: 'all', priority: 'all', status: 'all' });
  };

  return (
    <div className="relative">
      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute right-0 top-16 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-[9999] p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Статус</label>
              <div className="space-y-1">
                {[
                  { value: 'all', label: 'Все' },
                  { value: 'unread', label: 'Непрочитанные' },
                  { value: 'read', label: 'Прочитанные' },
                  { value: 'archived', label: 'Архив' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ status: option.value as typeof filters.status })}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      filters.status === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Категория</label>
              <div className="space-y-1">
                {[
                  { value: 'all', label: 'Все' },
                  { value: 'overdue', label: 'Просроченные' },
                  { value: 'low-stock', label: 'Склад (мало)' },
                  { value: 'out-of-stock', label: 'Склад (нет)' },
                  { value: 'finance', label: 'Финансы' },
                  { value: 'schedule', label: 'График' },
                  { value: 'system', label: 'Система' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ category: option.value as typeof filters.category })}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      filters.category === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Приоритет</label>
              <div className="space-y-1">
                {[
                  { value: 'all', label: 'Все' },
                  { value: 'high', label: 'Высокий' },
                  { value: 'medium', label: 'Средний' },
                  { value: 'low', label: 'Низкий' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilters({ priority: option.value as typeof filters.priority })}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      filters.priority === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Уведомления</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 text-xs"
          >
            <Filter className="w-3 h-3 mr-1" />
            Фильтры
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Все прочитано
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-6 text-center">
          <Bell className="w-12 h-12 text-gray-300 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400 text-sm">Нет уведомлений</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`block border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors ${
                notification.status === 'unread' ? 'bg-blue-50' : ''
              } ${notification.status === 'archived' ? 'grayscale' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(notification.status)}
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {priorityLabels[notification.priority]}
                          </span>
                        </div>
                        <p className={`text-sm ${notification.status === 'unread' ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-700 dark:text-slate-300'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          {new Date(notification.date).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Перейти
                        </Link>
                      )}
                      {notification.status !== 'archived' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notification.status === 'unread') {
                                markAsUnread(notification.id);
                              } else {
                                markAsRead(notification.id);
                              }
                            }}
                            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 flex items-center gap-1"
                          >
                            {notification.status === 'unread' ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Прочитать
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                Непрочитанное
                              </>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              archive(notification.id);
                            }}
                            className="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:text-slate-300 flex items-center gap-1"
                          >
                            <Archive className="w-3 h-3" />
                            В архив
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
