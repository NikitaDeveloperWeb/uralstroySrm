'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, RefreshCw, Filter, Eye, EyeOff, Archive, Trash2, CheckCircle2, AlertTriangle, PackageX } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/NotificationContext';
import { Button } from '@/shared/components/ui/button';

export function NotificationOverlay() {
  const { isOpen, closeOpen, notifications, unreadCount, markAsRead, markAsUnread, archive, deleteNotification, markAllAsRead, refreshNotifications, setFilters, filters } = useNotifications();

  const [showFilters, setShowFilters] = useState(false);

  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />;
      case 'low-stock': return <PackageX className="w-5 h-5 text-yellow-600 flex-shrink-0" />;
      default: return <Bell className="w-5 h-5 text-gray-600 flex-shrink-0" />;
    }
  };

  const getPriorityColor = (priority: string) => priority === 'high' ? 'border-l-red-500' : 'border-l-yellow-500';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Новый</span>;
      case 'read': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Прочитан</span>;
      case 'archived': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Архив</span>;
    }
  };

  const hasActiveFilters = filters.category !== 'all' || filters.priority !== 'all' || filters.status !== 'all';
  const clearFilters = () => setFilters({ category: 'all', priority: 'all', status: 'all' });

  const filtered = notifications.filter(n => {
    if (filters.category !== 'all' && n.category !== filters.category) return false;
    if (filters.priority !== 'all' && n.priority !== filters.priority) return false;
    if (filters.status !== 'all' && n.status !== filters.status) return false;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-[100000]" onClick={closeOpen} style={{ background: 'rgba(0,0,0,0.15)' }} />
      <div data-notification-overlay className="fixed left-0 right-0 top-16 mx-auto w-[720px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100001] overflow-hidden" style={{ pointerEvents: 'auto' }}>
        
        {/* Filters */}
        {showFilters && (
          <div className="absolute left-0 top-full w-full bg-white rounded-b-xl shadow-xl border border-gray-200 z-10 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                {['all:Все','unread:Непрочитанные','read:Прочитанные','archived:Архив'].map(v => {
                  const [val, label] = v.split(':');
                  return (
                    <button key={val} onClick={() => setFilters({ status: val as any })}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${filters.status === val ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                {['all:Все','overdue:Просроченные','low-stock:Склад (мало)','out-of-stock:Склад (нет)','finance:Финансы','schedule:График','system:Система'].map(v => {
                  const [val, label] = v.split(':');
                  return (
                    <button key={val} onClick={() => setFilters({ category: val as any })}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${filters.category === val ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
                {['all:Все','high:Высокий','medium:Средний','low:Низкий'].map(v => {
                  const [val, label] = v.split(':');
                  return (
                    <button key={val} onClick={() => setFilters({ priority: val as any })}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${filters.priority === val ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {hasActiveFilters && <button onClick={clearFilters} className="w-full text-center text-sm text-blue-600 font-medium">Сбросить фильтры</button>}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Уведомления</h3>
            {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unreadCount}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="flex-1 text-xs">
              <Filter className="w-3 h-3 mr-1" /> Фильтры
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-xs" disabled={unreadCount === 0}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Все прочитано
            </Button>
            <Button variant="outline" size="sm" onClick={refreshNotifications} className="text-xs">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Нет уведомлений</p>
            {hasActiveFilters && <button onClick={clearFilters} className="mt-2 text-sm text-blue-600">Сбросить фильтры</button>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {filtered.map(n => (
              <div key={n.id} onClick={() => n.status === 'unread' && markAsRead(n.id)}
                className={`block border-l-4 ${getPriorityColor(n.priority)} hover:bg-gray-50 bg-white ${n.status === 'unread' ? 'bg-blue-50' : ''} ${n.status === 'archived' ? 'grayscale' : ''}`}
                style={{ pointerEvents: 'auto' }}>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(n.status)}
                        <span className="text-xs text-gray-500">{n.priority === 'high' ? 'Высокий' : 'Средний'}</span>
                      </div>
                      <p className={`text-sm ${n.status === 'unread' ? 'font-medium' : ''}`}>{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(n.date).toLocaleDateString('ru-RU')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {n.link && (
                          <Link href={n.link} onClick={e => e.stopPropagation()} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Перейти
                          </Link>
                        )}
                        {n.status !== 'archived' && (
                          <>
                            <button onClick={e => { e.stopPropagation(); n.status === 'unread' ? markAsUnread(n.id) : markAsRead(n.id); }}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                              {n.status === 'unread' ? <><EyeOff className="w-3 h-3" /> Прочитать</> : <><Eye className="w-3 h-3" /> Непрочитанное</>}
                            </button>
                            <button onClick={e => { e.stopPropagation(); archive(n.id); }}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                              <Archive className="w-3 h-3" /> В архив
                            </button>
                          </>
                        )}
                        <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto">
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
    </>
  );
}
