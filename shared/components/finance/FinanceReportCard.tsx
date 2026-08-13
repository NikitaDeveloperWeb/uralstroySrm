'use client';

import { Button } from '@/shared/components/ui/button';

interface FinanceReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  accentColor: string;
  onAction: () => void;
  actionLabel: string;
  statLabel?: string;
  statValue?: string;
}

export function FinanceReportCard({
  title,
  description,
  icon,
  color,
  accentColor,
  onAction,
  actionLabel,
  statLabel,
  statValue,
}: FinanceReportCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className={`h-1.5 ${accentColor}`} />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2.5 rounded-lg ${color} flex-shrink-0`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          </div>
        </div>

        {statLabel && statValue && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-0.5">{statLabel}</p>
            <p className="text-lg font-bold text-gray-900">{statValue}</p>
          </div>
        )}

        <Button
          onClick={onAction}
          variant="outline"
          className="w-full h-10 text-sm font-medium rounded-lg"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
