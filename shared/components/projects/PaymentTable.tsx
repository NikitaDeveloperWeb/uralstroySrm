'use client';

interface PaymentCategory {
  name: string;
  percentage: number;
}

interface PaymentTableProps {
  categories: PaymentCategory[];
  projectCost: number;
  paymentStatuses: (string | null)[];
  onToggleStatus: (index: number) => void;
}

export function PaymentTable({ categories, projectCost, paymentStatuses, onToggleStatus }: PaymentTableProps) {
  const totalPercent = categories.reduce((sum, cat) => sum + cat.percentage, 0);
  const totalAmount = Math.round((projectCost * totalPercent) / 100);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Оплата труда</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Категория</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Процент</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Сумма (₽)</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Статус</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-900">{cat.name}</td>
              <td className="py-3 px-4 text-center text-gray-600">{cat.percentage}%</td>
              <td className="py-3 px-4 text-right font-medium text-gray-900">
                {Math.round((projectCost * cat.percentage) / 100).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onToggleStatus(index)}
                  className={`${paymentStatuses[index] === 'executed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:opacity-80`}>
                  {paymentStatuses[index] === 'executed' ? 'Выполнен' : 'Не выполнен'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td className="py-3 px-4 font-bold text-gray-900">Итого</td>
            <td className="py-3 px-4 text-center font-bold text-gray-900">{totalPercent}%</td>
            <td className="py-3 px-4 text-right font-bold text-[#1976d2] text-lg">{totalAmount.toLocaleString()}</td>
            <td className="py-3 px-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
