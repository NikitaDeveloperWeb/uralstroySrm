import { DashboardHeader } from '@/shared/components/dashboard/DashboardHeader';
import { StatCard } from '@/shared/components/dashboard/StatCard';
import { TodoWidget } from '@/shared/components/dashboard/TodoWidget';
import { SquareChart } from '@/shared/components/dashboard/SquareChart';
import { StatusChart } from '@/shared/components/dashboard/StatusChart';

export default function DashboardPage() {
  const stats = [
    { label: 'Объектов в работе', value: '12', color: 'bg-[#1976d2]' },
    { label: 'Сотрудников', value: '45', color: 'bg-[#2e7d32]' },
    { label: 'Средний объем (м²)', value: '250', color: 'bg-[#7b1fa2]' },
    { label: 'Сегодня на смене', value: '28', color: 'bg-[#d32f2f]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
      <DashboardHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} label={stat.label} value={stat.value} color={stat.color} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TodoWidget />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="w-full">
            <SquareChart />
          </div>
          <StatusChart />
        </div>
      </div>
    </div>
  );
}
