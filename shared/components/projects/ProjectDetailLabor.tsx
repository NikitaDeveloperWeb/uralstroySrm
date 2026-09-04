'use client';

import { formatCurrency, MANAGER_PERCENTAGE } from './projectDetailUtils';
import { PaymentTable } from './PaymentTable';
import { ManagerPayment } from './ManagerPayment';

interface Props {
  categories: { name: string; percentage: number }[];
  projectCost: number;
}

export function ProjectDetailLabor({ categories, projectCost }: Props) {
  return (
    <>
      <PaymentTable
        categories={categories}
        projectCost={projectCost}
      />
      <ManagerPayment projectCost={projectCost} percentage={MANAGER_PERCENTAGE} />
    </>
  );
}
