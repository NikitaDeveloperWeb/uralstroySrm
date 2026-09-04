'use client';

interface PaymentCategory {
  name: string;
  percentage: number;
}

interface PaymentTableProps {
  categories: PaymentCategory[];
  projectCost: number;
}

export function PaymentTable({ categories, projectCost }: PaymentTableProps) {
  const totalPercent = categories.reduce((sum, cat) => sum + cat.percentage, 0);
  const totalAmount = Math.round((projectCost * totalPercent) / 100);

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-2xl">💼</span>
          Примерные расчеты оплаты труда
        </h2>
        <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">Категории работников</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-700">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Категория</th>
              <th className="text-center py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Процент</th>
              <th className="text-right py-4 px-4 text-xs font-semibold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Сумма (₽)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {categories.map((cat, index) => {
              const amount = Math.round((projectCost * cat.percentage) / 100);

              return (
                <tr key={index} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600 dark:text-slate-300 font-medium">{cat.percentage}%</td>
                  <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">{amount.toLocaleString('ru-RU')} ₽</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-t-2 border-blue-200 dark:border-blue-700">
              <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">Итого</td>
              <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">{totalPercent}%</td>
              <td className="py-4 px-4 text-right font-bold text-blue-700 text-lg">{totalAmount.toLocaleString('ru-RU')} ₽</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
