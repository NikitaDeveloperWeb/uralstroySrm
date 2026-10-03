import { prisma } from '@/lib/prisma';

async function main() {
  const tables = await prisma.$queryRaw<any[]>`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
  console.log(tables.map(t => t.tablename).join('\n'));
}

main();
