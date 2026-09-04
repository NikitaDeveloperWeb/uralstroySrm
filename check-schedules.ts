import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.schedule.count();
    console.log(`Total schedules: ${count}`);
    
    const samples = await prisma.schedule.findMany({ take: 3 });
    console.log('Sample:', JSON.stringify(samples, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
