'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Card } from '@/shared/components/ui/card';

interface AnalyticsData {
  monthlyIncomeExpense: { month: string; income: number; expense: number }[];
  expenseByCategory: { name: string; value: number }[];
  salaryTrend: { month: string; amount: number }[];
  bonusPenaltyData: { name: string; value: number }[];
  projectCosts: { name: string; value: number }[];
  projectProfit: { project: string; profit: number }[];
  dailyExpenses: { date: string; amount: number }[];
  incomeExpenseRatio: { month: string; ratio: number }[];
  reportsByType: { name: string; value: number }[];
  projectStatuses: { name: string; value: number }[];
}

const COLORS = ['#1976d2', '#8e24aa', '#4caf50', '#ff9800', '#f44336', '#00bcd4'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 dark:text-slate-400">Загрузка аналитики...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Аналитика</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Доходы vs Расходы по месяцам */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Доходы vs Расходы</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.monthlyIncomeExpense}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#1976d2" name="Доходы" />
              <Bar dataKey="expense" fill="#f44336" name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 2. Распределение расходов по категориям */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Расходы по категориям</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 3. Динамика зарплат */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Динамика зарплат</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.salaryTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8e24aa" name="Зарплаты" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 4. Бонусы и штрафы */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Бонусы и штрафы</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.bonusPenaltyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
              <Legend />
              <Bar dataKey="value" fill="#4caf50" name="Сумма" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 5. Топ проектов по стоимости */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Топ проектов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.projectCosts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
              <Legend />
              <Bar dataKey="value" fill="#ff9800" name="Стоимость" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 6. Прибыль по проектам */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Прибыль по проектам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.projectProfit} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="project" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#ff9800" name="Прибыль" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 7. Динамика расходов по дням */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Динамика расходов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.dailyExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="amount" stroke="#00bcd4" fill="#00bcd4" name="Расходы" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* 8. Отношение доходов к расходам */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Рентабельность</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.incomeExpenseRatio}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ratio" fill="#4caf50" name="Коэффициент" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 9. Отчеты по типам */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Отчеты по типам</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.reportsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.reportsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* 10. Статусы проектов */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Статусы проектов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.projectStatuses}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.projectStatuses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
