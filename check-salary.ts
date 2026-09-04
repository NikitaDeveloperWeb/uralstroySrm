import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.salaryReport.findMany({
    include: { items: true },
    orderBy: { date: 'desc' },
  });

  console.log('=== SALARY REPORTS IN DB ===');
  console.log('Count:', reports.length);
  
  for (const r of reports) {
    console.log({
      id: r.id,
      period: r.period,
      totalAmount: r.totalAmount,
      status: r.status,
      itemCount: r.items.length,
      items: r.items.map(i => ({
        employeeId: i.employeeId,
        employeeName: i.employeeName,
        amount: i.amount,
      })),
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
