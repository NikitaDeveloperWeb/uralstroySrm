const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check suppliers
    const suppliers = await prisma.supplier.findMany();
    console.log(`\nSuppliers: ${suppliers.length}`);
    suppliers.forEach(s => console.log(`  - ${s.companyName} (${s.category})`));

    // Check projects
    const projects = await prisma.project.findMany({ take: 5 });
    console.log(`\nProjects: ${projects.length}`);
    projects.forEach(p => console.log(`  - ${p.name} (${p.status})`));

    // Check warehouse items
    const items = await prisma.warehouseItem.findMany({ take: 5 });
    console.log(`\nWarehouse items: ${items.length}`);
    items.forEach(i => console.log(`  - ${i.name}: ${i.quantity} ${i.unit}`));

    // Check expenses
    const expenses = await prisma.expense.count();
    console.log(`\nExpenses: ${expenses}`);

    // Check employees
    const employees = await prisma.employee.count();
    console.log(`Employees: ${employees}`);

    // Check clients
    const clients = await prisma.client.count();
    console.log(`Clients: ${clients}`);

    console.log('\n✓ Data restored successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
