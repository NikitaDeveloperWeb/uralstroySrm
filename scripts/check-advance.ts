import { prisma } from '@/lib/prisma';

async function main() {
  const report = await prisma.advanceReport.findUnique({ where: { id: 80 } });
  console.log('Report 80:', report ? 'found' : 'not found');
  
  const all = await prisma.advanceReport.findMany({ select: { id: true } });
  console.log('All advance report IDs:', all.map(r => r.id).join(', '));
}

main();
