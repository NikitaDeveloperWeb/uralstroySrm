'use client';

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/shared/contexts/NotificationContext';

export function NotificationBell() {
  const { unreadCount, isVisible, isOpen, toggleOpen, closeOpen } = useNotifications();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-notification-bell]') && !target.closest('[data-notification-overlay]')) {
          closeOpen();
        }
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, closeOpen]);

  const shouldAnimate = isVisible && !isOpen;

  return (
    <div data-notification-bell>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleOpen();
        }}
        className={`relative p-2 text-gray-600 dark:text-slate-300 dark:text-slate-300 hover:text-[#1976d2] hover:bg-gray-100 dark:hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-lg transition-all mr-2 ${
          shouldAnimate ? 'animate-bounce' : ''
        }`}
        title="Уведомления"
      >
        <Bell className={`w-5 h-5 transition-transform ${isOpen ? 'scale-110' : ''}`} />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 ${
              shouldAnimate ? 'animate-pulse' : ''
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
