import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allReports = await prisma.salaryReport.findMany({
    include: { items: true },
  });

  for (const report of allReports) {
    await prisma.salaryReportItem.deleteMany({
      where: { reportId: report.id },
    });
    await prisma.salaryReport.delete({
      where: { id: report.id },
    });
    console.log(`Удален отчет: ${report.period} (id=${report.id})`);
  }

  console.log(`Удалено ${allReports.length} зарплатных отчетов`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
