'use client';

import { useState, useEffect, memo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Card } from '@/shared/components/ui/card';
import { Modal } from '@/shared/components/ui/Modal';

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

type ChartType = 'income-expense' | 'expense-category' | 'salary' | 'bonus-penalty' | 'project-costs' | 'project-profit' | 'daily-expenses' | 'ratio' | 'reports-type' | 'project-status';

interface ChartConfig {
  title: string;
  type: ChartType;
}

// Memoized chart components
const IncomeExpenseChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
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
));

const ExpenseCategoryChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data.expenseByCategory}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        outerRadius="80%"
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
));

const SalaryTrendChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data.salaryTrend}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="amount" stroke="#8e24aa" name="Зарплаты" />
    </LineChart>
  </ResponsiveContainer>
));

const BonusPenaltyChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data.bonusPenaltyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
      <Legend />
      <Bar dataKey="value" fill="#4caf50" name="Сумма" />
    </BarChart>
  </ResponsiveContainer>
));

const ProjectCostsChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data.projectCosts} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="name" type="category" width={100} />
      <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('ru-RU')} ₽`} />
      <Legend />
      <Bar dataKey="value" fill="#ff9800" name="Стоимость" />
    </BarChart>
  </ResponsiveContainer>
));

const ProjectProfitChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data.projectProfit} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="project" type="category" width={100} />
      <Tooltip />
      <Legend />
      <Bar dataKey="profit" fill="#ff9800" name="Прибыль" />
    </BarChart>
  </ResponsiveContainer>
));

const DailyExpensesChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data.dailyExpenses}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Area type="monotone" dataKey="amount" stroke="#00bcd4" fill="#00bcd4" name="Расходы" />
    </AreaChart>
  </ResponsiveContainer>
));

const RatioChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data.incomeExpenseRatio}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="ratio" fill="#4caf50" name="Коэффициент" />
    </BarChart>
  </ResponsiveContainer>
));

const ReportsTypeChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data.reportsByType}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, value }) => `${name}: ${value}`}
        outerRadius="80%"
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
));

const ProjectStatusesChart = memo(({ data }: { data: AnalyticsData }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data.projectStatuses}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        outerRadius="80%"
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
));

const CHART_MAP: Record<ChartType, { component: React.ComponentType<{ data: AnalyticsData }>; title: string }> = {
  'income-expense': { component: IncomeExpenseChart, title: 'Доходы vs Расходы' },
  'expense-category': { component: ExpenseCategoryChart, title: 'Расходы по категориям' },
  'salary': { component: SalaryTrendChart, title: 'Динамика зарплат' },
  'bonus-penalty': { component: BonusPenaltyChart, title: 'Бонусы и штрафы' },
  'project-costs': { component: ProjectCostsChart, title: 'Топ проектов' },
  'project-profit': { component: ProjectProfitChart, title: 'Прибыль по проектам' },
  'daily-expenses': { component: DailyExpensesChart, title: 'Динамика расходов' },
  'ratio': { component: RatioChart, title: 'Рентабельность' },
  'reports-type': { component: ReportsTypeChart, title: 'Отчеты по типам' },
  'project-status': { component: ProjectStatusesChart, title: 'Статусы проектов' },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalChart, setModalChart] = useState<ChartType | null>(null);

  useEffect(() => {
    console.log('modalChart changed:', modalChart);
  }, [modalChart]);

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

  const chartTypes: ChartType[] = [
    'income-expense',
    'expense-category',
    'salary',
    'bonus-penalty',
    'project-costs',
    'project-profit',
    'daily-expenses',
    'ratio',
    'reports-type',
    'project-status',
  ];

  const ChartComponent = modalChart ? CHART_MAP[modalChart].component : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Аналитика</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chartTypes.map((type) => {
          const config = CHART_MAP[type];
          const Chart = config.component;
          return (
            <div
              key={type}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setModalChart(type)}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{config.title}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <Chart data={data} />
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      {/* Модальное окно с графиком */}
      {modalChart && ChartComponent ? (
        <Modal
          key={modalChart}
          isOpen={true}
          onClose={() => setModalChart(null)}
          title={CHART_MAP[modalChart].title}>
          <div className="w-full h-[80vh]">
            <ChartComponent data={data} />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
