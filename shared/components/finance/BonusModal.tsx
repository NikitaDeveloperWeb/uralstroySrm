'use client';

import { BonusPenaltyModal } from './BonusPenaltyModal';
import { Star } from 'lucide-react';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BonusModal({ isOpen, onClose }: BonusModalProps) {
  return (
    <BonusPenaltyModal
      isOpen={isOpen}
      onClose={onClose}
      title="Премия"
      entityName="премия"
      icon={<Star className="w-4 h-4 text-green-600" />}
      apiEndpoint="/api/bonuses"
      colors={{
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        iconColor: 'text-green-600',
        button: 'bg-green-600',
        buttonHover: 'hover:bg-green-700',
        monthBg: 'bg-green-50',
        monthBorder: 'border-green-200',
        monthText: 'text-green-800',
        monthTotal: 'text-green-700',
        monthIcon: 'text-green-600',
        amountPrefix: '+',
        emptyIcon: <Star className="w-12 h-12 text-gray-300 dark:text-slate-500 mx-auto mb-3" />,
        emptyTitle: 'Премий нет',
        emptySubtitle: 'Премии будут отображаться здесь',
        infoText: 'Премия будет добавлена к зарплате при генерации зарплатного отчета',
        infoBg: 'bg-emerald-50',
        infoTextColor: 'text-emerald-800',
        placeholder: 'Сумма премии (₽)',
      }}
    />
  );
}
