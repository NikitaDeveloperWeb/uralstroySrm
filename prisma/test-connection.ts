import { PrismaClient } from '@prisma/client';

const pgPrisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL || 'postgresql://postgres.tjillfxmvwnjedbobhoj:tKn-4aB-e87-AgD@aws-0-eu-central-2.pooler.supabase.com:6543/postgres?pgbouncer=true' }
  }
});

async function main() {
  console.log('Testing Supabase connection via Prisma...\n');
  
  try {
    await pgPrisma.$connect();
    const result = await pgPrisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✓ Connected successfully!');
    console.log('Current time:', result);
    
    const tables = await pgPrisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:', tables);
    
    await pgPrisma.$disconnect();
  } catch (e: any) {
    console.error('✗ Connection failed:', e.message?.substring(0, 200));
  }
}

main();
