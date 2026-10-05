import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'), { readonly: true });

const TABLES = [
  'users', 'clients', 'brigades', 'employees', 'unit_rates', 'projects',
  'suppliers', 'warehouse_items', 'warehouse_movements', 'hourly_rates',
  'bonuses', 'penalties', 'expenses', 'advance_reports', 'advance_report_items',
  'completed_works', 'schedules', 'documents', 'skills', 'expense_categories',
  'employee_advances', 'subcontractors', 'eot_reports', 'eot_report_items',
  'salary_reports', 'salary_report_items', 'project_transactions',
  'project_overheads', 'project_overhead_templates', 'material_estimates',
  'material_templates', 'work_templates', 'payment_categories', 'funds',
  'fund_transactions', 'project_reports', 'shop_reports', 'shop_report_items',
  'employee_work_reports', 'finance_reports', 'financial_plans', 'notifications',
  'tech_equipment', 'summary_reports', 'contractors', 'contractor_contracts',
  'contractor_payments', '_BrigadeSkills', '_EmployeeSkills', '_ProjectToSubcontractor',
];

const BOOLEAN_FIELDS = [
  'is_active', 'is_system', 'is_paid', 'has_veranda', 'has_mansard',
  'has_porch', 'hasPorhCh', 'hasMansard', 'hasVeranda', 'isRead',
  'is_archived', 'is_valid', 'is_completed', 'is_approved',
];

function transformValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  if (BOOLEAN_FIELDS.includes(key) && typeof value === 'number') {
    return value === 1;
  }
  if (typeof value === 'number' && value > 946684800000) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return value;
}

const allData: Record<string, any[]> = {};
let totalRecords = 0;

console.log('=== Exporting from dev.db ===\n');

for (const table of TABLES) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get() as { c: number };
    if (count.c === 0) continue;
    const records = db.prepare(`SELECT * FROM "${table}"`).all();
    const transformed = records.map(r => {
      const t: Record<string, any> = {};
      for (const [k, v] of Object.entries(r)) {
        t[k] = transformValue(k, v);
      }
      return t;
    });
    allData[table] = transformed;
    totalRecords += transformed.length;
    console.log(`  ${table}: ${transformed.length}`);
  } catch (e) {
    // skip
  }
}

console.log(`\n=== Total: ${totalRecords} records ===\n`);

const outputPath = path.join(process.cwd(), 'prisma', 'dev-data-export.json');
fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
console.log(`Exported to: ${outputPath}`);

db.close();
