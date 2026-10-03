import { prisma } from '@/lib/prisma';

async function main() {
  const octoberReports = await prisma.advanceReport.findMany({
    where: {
      date: {
        gte: new Date('2026-10-01'),
        lt: new Date('2026-11-01'),
      },
    },
    select: { id: true, date: true, totalAmount: true },
  });

  console.log('October reports to delete:', octoberReports);

  for (const report of octoberReports) {
    await prisma.advanceReportItem.deleteMany({
      where: { reportId: report.id },
    });
    await prisma.advanceReport.delete({
      where: { id: report.id },
    });
    console.log(`Deleted report #${report.id}`);
  }

  console.log('Done');
}

main();
