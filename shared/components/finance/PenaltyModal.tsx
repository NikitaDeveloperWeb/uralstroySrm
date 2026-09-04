'use client';

import { BonusPenaltyModal } from './BonusPenaltyModal';
import { AlertTriangle } from 'lucide-react';

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PenaltyModal({ isOpen, onClose }: PenaltyModalProps) {
  return (
    <BonusPenaltyModal
      isOpen={isOpen}
      onClose={onClose}
      title="Штраф"
      entityName="штраф"
      icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
      apiEndpoint="/api/penalties"
      colors={{
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-900',
        iconColor: 'text-red-600',
        button: 'bg-red-600',
        buttonHover: 'hover:bg-red-700',
        monthBg: 'bg-red-50',
        monthBorder: 'border-red-200',
        monthText: 'text-red-800',
        monthTotal: 'text-red-700',
        monthIcon: 'text-red-600',
        amountPrefix: '-',
        emptyIcon: <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-slate-500 mx-auto mb-3" />,
        emptyTitle: 'Штрафов нет',
        emptySubtitle: 'Штрафы будут отображаться здесь',
        infoText: 'Штраф будет вычтен из зарплаты при генерации зарплатного отчета',
        infoBg: 'bg-orange-50',
        infoTextColor: 'text-orange-800',
        placeholder: 'Сумма штрафа (₽)',
      }}
    />
  );
}
