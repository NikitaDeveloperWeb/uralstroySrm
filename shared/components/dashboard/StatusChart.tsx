'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'В работе', value: 12, color: '#1976d2' },
  { name: 'Завершены', value: 8, color: '#2e7d32' },
  { name: 'На паузе', value: 3, color: '#f57c00' },
];

export function StatusChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Статус объектов</h2>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="h-64 w-full md:w-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
              <span className="text-sm text-gray-600 dark:text-slate-300 ml-auto">{item.value} объектов</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
