import { prisma } from '@/lib/prisma';

async function main() {
  const reports = await prisma.advanceReport.findMany({ 
    select: { id: true, date: true, totalAmount: true } 
  });
  console.log('All advance reports:', reports);
}

main();
