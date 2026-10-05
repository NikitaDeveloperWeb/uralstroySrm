import Database from 'better-sqlite3';
import path from 'path';

const BACKUP = path.join(process.cwd(), 'prisma', 'backups', 'backup_2026-10-03T08-46-19.db');
const sqlite = new Database(BACKUP, { readonly: true });

const tables = [
  'users', 'clients', 'brigades', 'employees', 'unit_rates', 'projects',
  'suppliers', 'warehouse_items', 'warehouse_movements', 'hourly_rates',
  'bonuses', 'expenses', 'advance_reports', 'advance_report_items',
  'completed_works', 'schedules', 'documents', 'skills', 'expense_categories',
  'employee_advances', 'subcontractors', 'eot_reports', 'eot_report_items',
  'salary_reports', 'salary_report_items', 'project_transactions',
  'project_overheads', 'material_estimates', 'project_overhead_templates',
  'material_templates', 'work_templates', 'payment_categories', 'funds',
  'fund_transactions', 'project_reports', 'shop_reports', 'shop_report_items',
  'employee_work_reports', 'finance_reports', 'financial_plans', 'notifications',
  'tech_equipment', 'summary_reports',
];

console.log('=== Exporting data from SQLite backup ===\n');

const allData: Record<string, any[]> = {};
let totalRecords = 0;

for (const table of tables) {
  try {
    const count = sqlite.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get() as { c: number };
    if (count.c === 0) continue;
    
    const records = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    allData[table] = records;
    totalRecords += records.length;
    console.log(`  ${table}: ${records.length}`);
  } catch {
    // skip
  }
}

console.log(`\n=== Total: ${totalRecords} records ===\n`);

// Сохраняем в JSON
const fs = require('fs');
const outputPath = path.join(process.cwd(), 'prisma', 'data-export.json');
fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
console.log(`✓ Data exported to: ${outputPath}`);

sqlite.close();
