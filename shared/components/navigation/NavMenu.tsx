'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { NotificationBell } from './NotificationBell';
import { ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext';

const navItems = [
  {
    href: '/dashboard',
    label: 'Дашборд',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    href: '/projects',
    label: 'Объекты',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    href: '/clients',
    label: 'Клиенты',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    href: '/materials',
    label: 'Материалы',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    href: '/employees',
    label: 'Сотрудники',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    href: '/work-types',
    label: 'Виды работ',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h1m-1 4h1m-5 4h1m-1 4h1m-5 4h1m-1 4h1m-5 4h1',
  },
  {
    href: '/reports',
    label: 'Отчеты',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/finance',
    label: 'Финансы',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    href: '/schedule',
    label: 'График работы',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z',
  },
  {
    href: '/subcontractors',
    label: 'Подрядчики и поставщики',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    href: '/supplier-settlements',
    label: 'Расчёты с поставщиками',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    href: '/tech-equipment',
    label: 'Техника и оборудование',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
  },
  {
    href: '/skills',
    label: 'Навыки',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    href: '/expense-categories',
    label: 'Категории расходов',
    icon: 'M7 7h.01M7 7h.01M7 7h.01M17 7h.01M17 7h.01M17 7h.01M7 12h.01M7 12h.01M7 12h.01M17 12h.01M17 12h.01M17 12h.01M7 17h.01M7 17h.01M7 17h.01M17 17h.01M17 17h.01M17 17h.01',
  },
  {
    href: '/documents',
    label: 'Документы',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/analytics',
    label: 'Аналитика',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

export function NavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('nav-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('nav-collapsed', String(next));
    document.querySelector('main')?.classList.toggle('nav-collapsed', next);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  if (pathname === '/login') return null;

  return (
    <aside className={`bg-white dark:bg-slate-800 dark:bg-slate-800 shadow-lg fixed h-full border-r border-gray-200 dark:border-slate-700 dark:border-slate-700 flex flex-col justify-between overflow-hidden transition-all duration-300 ${collapsed ? 'w-16' : 'w-72'}`}>
      <div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-slate-700 dark:border-slate-700">
            <div className="w-10 h-10 bg-[#1976d2] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">УС</span>
            </div>
            {!collapsed && (
              <>
                <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400 truncate">УралСтройCRM</h1>
                <NotificationBell />
              </>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${collapsed ? 'justify-center px-0' : ''} ${
                    isActive
                      ? 'bg-[#e3f2fd] dark:bg-blue-900/30 text-[#1976d2] dark:text-blue-400 font-semibold'
                      : 'text-[#424242] dark:text-slate-300 hover:bg-[#f5f7fa] dark:hover:bg-slate-700'
                  }`}>
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={`w-full border-gray-300 dark:border-slate-600 dark:border-slate-600 text-gray-700 dark:text-slate-300 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 ${collapsed ? 'px-2' : ''}`}
        >
          <span className={collapsed ? '' : 'mr-2'}>🚪</span>
          {!collapsed && 'Выйти'}
        </Button>
        <button
          onClick={toggle}
          className="mt-2 w-full flex items-center justify-center p-2 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-md transition-colors"
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={toggleTheme}
          className="mt-2 w-full flex items-center justify-center p-2 text-gray-400 dark:text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-700 rounded-md transition-colors"
          title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
