import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      name: 'Администратор',
      role: 'admin',
    },
  });

  console.log(`User created: ${user.email} / admin123`);
}

main();
