import { prisma } from '@/lib/prisma';

async function main() {
  // Update existing user roles from lowercase to uppercase
  await prisma.$executeRaw`UPDATE users SET role = 'ADMIN' WHERE role = 'admin';`;
  await prisma.$executeRaw`UPDATE users SET role = 'MANAGER' WHERE role = 'manager';`;
  
  console.log('User roles updated to uppercase enum values');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
