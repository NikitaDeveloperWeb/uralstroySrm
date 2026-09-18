import ProgressIndicator from './ProgressIndicator';

interface SummaryCardsProps {
  totalPlanned: number;
  totalActual: number;
  totalProgress: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SummaryCards({ totalPlanned, totalActual, totalProgress }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 mb-1">Запланировано</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(totalPlanned)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 mb-1">Получено</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(totalActual)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-500 mb-1">Выполнение</div>
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {totalProgress}%
        </div>
        <ProgressIndicator progress={totalProgress} />
      </div>
    </div>
  );
}
