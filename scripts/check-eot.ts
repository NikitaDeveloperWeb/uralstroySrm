import { prisma } from '@/lib/prisma';

async function main() {
  const eotReports = await prisma.eOTReport.findMany({
    select: { 
      id: true, 
      date: true, 
      totalAmount: true,
      status: true,
    },
    orderBy: { date: 'desc' },
  });

  console.log('EOT Reports:');
  for (const r of eotReports) {
    const date = new Date(r.date);
    const month = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    console.log(`  #${r.id} | ${r.date} | ${month} | ${r.totalAmount}`);
  }
}

main();
