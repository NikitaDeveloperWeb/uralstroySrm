import { prisma } from '@/lib/prisma';

async function main() {
  const eotReports = await prisma.eOTReport.findMany({
    where: {
      date: {
        gte: new Date('2026-10-01'),
        lt: new Date('2026-11-01'),
      },
    },
    select: { 
      id: true, 
      date: true, 
      totalAmount: true,
    },
  });

  console.log('October EOT reports:');
  for (const r of eotReports) {
    const date = new Date(r.date);
    const local = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    const utc = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' as any });
    console.log(`  #${r.id} | raw: ${r.date} | local: ${local} | utc: ${utc}`);
  }
}

main();
