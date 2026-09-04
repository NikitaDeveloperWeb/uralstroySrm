'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { day: '26', sqm: 120 },
  { day: '27', sqm: 85 },
  { day: '28', sqm: 150 },
  { day: '29', sqm: 95 },
  { day: '30', sqm: 110 },
  { day: '31', sqm: 135 },
  { day: '1', sqm: 100 },
  { day: '2', sqm: 145 },
  { day: '3', sqm: 90 },
  { day: '4', sqm: 160 },
];

export function SquareChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Выполненная квадратура</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="day" 
              stroke="#6b7280" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickCount={6}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#1976d2', fontWeight: 500 }}
            />
            <Line 
              type="monotone" 
              dataKey="sqm" 
              stroke="#1976d2" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#1976d2' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
