'use client';

import { DashboardContent } from '@/shared/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white dark:text-white dark:text-white">Дашборд</h1>
      <DashboardContent />
    </div>
  );
}
