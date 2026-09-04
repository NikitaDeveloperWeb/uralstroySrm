const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const backupPath = 'prisma/backups/backup_2026-09-01T10-08-34.db';
const db = Database(backupPath);

// Get all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in backup:');
tables.forEach(t => console.log(`  - ${t.name}`));

// Count records in key tables
const keyTables = ['users', 'projects', 'clients', 'employees', 'suppliers', 'warehouse_items', 'expenses', 'project_transactions'];
console.log('\nRecord counts:');
keyTables.forEach(table => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`  ${table}: ${count.count}`);
  } catch {
    console.log(`  ${table}: table not found`);
  }
});

// Show suppliers
try {
  const suppliers = db.prepare('SELECT * FROM suppliers').all();
  console.log('\nSuppliers:');
  suppliers.forEach(s => console.log(`  - ${s.companyName} (${s.category})`));
} catch {}

// Show projects
try {
  const projects = db.prepare('SELECT id, name, status FROM projects LIMIT 5').all();
  console.log('\nProjects (first 5):');
  projects.forEach(p => console.log(`  - ${p.name} (${p.status})`));
} catch {}

// Show warehouse items
try {
  const items = db.prepare('SELECT id, name, quantity FROM warehouse_items LIMIT 5').all();
  console.log('\nWarehouse items (first 5):');
  items.forEach(i => console.log(`  - ${i.name}: ${i.quantity}`));
} catch {}

// Show expenses count
try {
  const count = db.prepare('SELECT COUNT(*) as count FROM expenses').get();
  console.log(`\nExpenses: ${count.count}`);
} catch {}

db.close();
