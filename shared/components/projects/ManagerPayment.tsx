'use client';

interface ManagerPaymentProps {
  projectCost: number;
  percentage: number;
}

export function ManagerPayment({ projectCost, percentage }: ManagerPaymentProps) {
  const amount = Math.round((projectCost * percentage) / 100);

  return (
    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Оплата менеджменту</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Стоимость объекта</p>
          <p className="text-lg font-semibold text-gray-900">{projectCost.toLocaleString()} ₽</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Процент на менеджмент</p>
          <p className="text-lg font-semibold text-gray-900">{percentage}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Сумма менеджменту</p>
          <p className="text-lg font-bold text-[#1976d2]">{amount.toLocaleString()} ₽</p>
        </div>
      </div>
    </div>
  );
}
