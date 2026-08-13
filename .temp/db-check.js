const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  console.log('\n=== ПРОЕКТЫ ===');
  const projects = await p.project.findMany({
    select: { id: true, name: true, code: true, type: true, status: true, area: true, address: true, cost: true, deadline: true, brigadeId: true },
    orderBy: { id: 'asc' }
  });
  console.log(`Всего: ${projects.length}`);
  projects.forEach(r => console.log(`  ${r.id} | ${r.code} | ${r.name} (${r.type}) | ${r.status} | ${r.area}м² | ${r.cost}₽ | ${r.address}`));

  console.log('\n=== БРИГАДЫ ===');
  const brigades = await p.brigade.findMany({
    select: { id: true, name: true, leaderId: true, memberIds: true, skills: true, employees: { select: { id: true, fullName: true } } },
    orderBy: { id: 'asc' }
  });
  console.log(`Всего: ${brigades.length}`);
  brigades.forEach(r => console.log(`  ${r.id} | ${r.name} | прораб: ${r.leaderId} | сотрудники: ${JSON.parse(r.memberIds).join(', ') || 'нет'}`));

  console.log('\n=== СОТРУДНИКИ ===');
  const employees = await p.employee.findMany({
    select: { id: true, fullName: true, phone: true, workplace: true, paymentType: true, brigadeId: true },
    orderBy: { id: 'asc' }
  });
  console.log(`Всего: ${employees.length}`);
  employees.forEach(r => console.log(`  ${r.id} | ${r.fullName} | ${r.phone} | ${r.workplace} | ${r.paymentType} | бригада: ${r.brigadeId || 'нет'}`));

  console.log('\n=== СКЛАД ===');
  const warehouse = await p.warehouseItem.findMany({
    select: { id: true, name: true, category: true, quantity: true, unit: true, status: true, lastUpdate: true },
    orderBy: { id: 'asc' }
  });
  console.log(`Всего: ${warehouse.length}`);
  warehouse.forEach(r => console.log(`  ${r.id} | ${r.name} | ${r.category} | ${r.quantity} ${r.unit} | ${r.status} | обновлено: ${r.lastUpdate.toISOString().split('T')[0]}`));

  console.log('\n=== ФОНДЫ ===');
  const funds = await p.fund.findMany({
    select: { id: true, name: true, balance: true, transactions: { select: { id: true, amount: true, type: true, description: true } } },
    orderBy: { id: 'asc' }
  });
  console.log(`Всего: ${funds.length}`);
  funds.forEach(r => console.log(`  ${r.id} | ${r.name} | баланс: ${r.balance}₽ | операций: ${r.transactions.length}`));

  console.log('\n=== ПЛАТЕЖНЫЕ КАТЕГОРИИ ===');
  const categories = await p.paymentCategory.findMany({ select: { id: true, name: true, percentage: true }, orderBy: { id: 'asc' } });
  console.log(`Всего: ${categories.length}`);
  categories.forEach(r => console.log(`  ${r.id} | ${r.name} | ${r.percentage}%`));

  console.log('\n=== УВЕДОМЛЕНИЯ (непрочитанные) ===');
  const notifications = await p.notification.findMany({
    where: { isRead: false, isArchived: false },
    select: { id: true, message: true, type: true, priority: true, date: true }
  });
  console.log(`Всего непрочитанных: ${notifications.length}`);
  notifications.forEach(r => console.log(`  ${r.id} | ${r.type} | ${r.priority} | ${r.message} | ${r.date.toISOString().split('T')[0]}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
