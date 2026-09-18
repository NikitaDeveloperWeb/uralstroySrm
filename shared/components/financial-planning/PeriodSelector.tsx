interface PeriodSelectorProps {
  periodFrom: Date;
  periodTo: Date;
  onPeriodChange: (from: Date, to: Date) => void;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPeriodLabel(from: Date, to: Date): string {
  if (from.getFullYear() === to.getFullYear() && from.getMonth() === to.getMonth()) {
    return `${from.toLocaleDateString('ru-RU', { day: 'numeric' })} – ${to.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export default function PeriodSelector({ periodFrom, periodTo, onPeriodChange }: PeriodSelectorProps) {
  const goToPrevious = () => {
    const isWeek = periodTo.getTime() - periodFrom.getTime() <= 7 * 24 * 60 * 60 * 1000;
    const newFrom = new Date(periodFrom);
    const newTo = new Date(periodTo);

    if (isWeek) {
      newFrom.setDate(newFrom.getDate() - 7);
      newTo.setDate(newTo.getDate() - 7);
    } else {
      newFrom.setMonth(newFrom.getMonth() - 1);
      newTo.setMonth(newTo.getMonth() - 1);
    }

    onPeriodChange(newFrom, newTo);
  };

  const goToNext = () => {
    const isWeek = periodTo.getTime() - periodFrom.getTime() <= 7 * 24 * 60 * 60 * 1000;
    const newFrom = new Date(periodFrom);
    const newTo = new Date(periodTo);

    if (isWeek) {
      newFrom.setDate(newFrom.getDate() + 7);
      newTo.setDate(newTo.getDate() + 7);
    } else {
      newFrom.setMonth(newFrom.getMonth() + 1);
      newTo.setMonth(newTo.getMonth() + 1);
    }

    onPeriodChange(newFrom, newTo);
  };

  const goToToday = () => {
    const today = new Date();
    const isWeek = periodTo.getTime() - periodFrom.getTime() <= 7 * 24 * 60 * 60 * 1000;

    if (isWeek) {
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      weekStart.setDate(weekStart.getDate() + diff);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      onPeriodChange(weekStart, weekEnd);
    } else {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      onPeriodChange(monthStart, monthEnd);
    }
  };

  const isWeek = periodTo.getTime() - periodFrom.getTime() <= 7 * 24 * 60 * 60 * 1000;
  const periodLabel = formatPeriodLabel(periodFrom, periodTo);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevious}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          ←
        </button>

        <div className="px-4 py-2 bg-white border border-gray-300 rounded">
          <span className="text-sm text-gray-500 mr-2">
            {isWeek ? `Неделя ${getWeekNumber(periodFrom)}` : new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(periodFrom)}
          </span>
          <span className="text-sm font-medium">{periodLabel}</span>
        </div>

        <button
          onClick={goToNext}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
        >
          →
        </button>
      </div>

      <button
        onClick={goToToday}
        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Сегодня
      </button>
    </div>
  );
}
