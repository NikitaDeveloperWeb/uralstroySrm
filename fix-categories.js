const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.expense.findMany({
  select: { id: true, category: true, amount: true },
  take: 10
}).then(expenses => {
  console.log('Sample expenses:', JSON.stringify(expenses, null, 2));
  return p.expense.updateMany({
    where: {
      OR: [
        { category: '' },
        { category: { equals: ' ', mode: 'insensitive' } }
      ]
    },
    data: { category: 'Прочее' }
  });
}).then(r => {
  console.log('Updated:', r.count);
  return p.$disconnect();
}).catch(e => {
  console.error(e);
  p.$disconnect();
  process.exit(1);
});
