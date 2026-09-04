'use client';

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${color}`} />
      <div className="pl-3">
        <p className="text-gray-600 dark:text-slate-300 text-sm font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
