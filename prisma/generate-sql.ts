import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'prisma', 'dev-data-export.json');
const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

const BOOLEAN_FIELDS = [
  'is_active', 'is_system', 'is_paid', 'has_veranda', 'has_mansard',
  'has_porch', 'hasPorhCh', 'hasMansard', 'hasVeranda', 'isRead',
  'is_archived', 'is_valid', 'is_completed', 'is_approved',
];

function escapeSql(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  return "'" + String(value).replace(/'/g, "''") + "'";
}

function formatDate(value: any): string {
  if (typeof value === 'number' && value > 946684800000) {
    return `'${new Date(value).toISOString()}'`;
  }
  if (typeof value === 'string' && value.includes('T')) {
    return `'${value}'`;
  }
  return escapeSql(value);
}

let sql = '-- Migration SQL generated from dev.db\n';
sql += '-- Run with: psql -h aws-0-eu-central-2.pooler.supabase.com -p 6543 -U postgres.tjillfxmvwnjedbobhoj -d postgres -f migration.sql\n\n';

const TABLE_ORDER = [
  'users', 'clients', 'skills', 'expense_categories', 'payment_categories',
  'hourly_rates', 'material_templates', 'work_templates', 'project_overhead_templates',
  'suppliers', 'contractors', 'brigades', 'employees', 'unit_rates',
  'subcontractors', 'tech_equipment', 'employee_advances', 'projects',
  'material_estimates', 'project_overheads', 'completed_works',
  'project_transactions', 'financial_plans', 'project_reports', 'finance_reports',
  'expenses', 'notifications', 'warehouse_items', 'warehouse_movements',
  'shop_reports', 'shop_report_items', 'employee_work_reports', 'schedules',
  'advance_reports', 'advance_report_items', 'eot_reports', 'eot_report_items',
  'penalties', 'bonuses', 'salary_reports', 'salary_report_items',
  'funds', 'fund_transactions', 'summary_reports',
  '_BrigadeSkills', '_EmployeeSkills', '_ProjectToSubcontractor',
  'contractor_contracts', 'contractor_payments', 'documents',
];

for (const tableName of TABLE_ORDER) {
  const records = rawData[tableName];
  if (!records || !records.length) continue;
  
  sql += `-- ${tableName}: ${records.length} records\n`;
  
  const columns = Object.keys(records[0]);
  
  for (const record of records) {
    const values = columns.map(col => {
      const key = col.toLowerCase();
      if (BOOLEAN_FIELDS.includes(key) && typeof record[col] === 'number') {
        return record[col] === 1 ? 'TRUE' : 'FALSE';
      }
      if (col === 'id') return escapeSql(record[col]);
      if (col.includes('Date') || col.includes('date') || col.includes('Time') || col.includes('time') || col === 'createdAt' || col === 'updatedAt' || col === 'date' || col === 'birthDate' || col === 'hireDate' || col === 'deadline' || col === 'lastUpdate' || col === 'periodFrom' || col === 'periodTo' || col === 'contractDate' || col === 'startDate' || col === 'endDate' || col === 'acquisitionDate') {
        return formatDate(record[col]);
      }
      return escapeSql(record[col]);
    });
    
    const cols = columns.map(c => `"${c}"`).join(', ');
    sql += `INSERT INTO "${tableName}" (${cols}) VALUES (${values.join(', ')});\n`;
  }
  
  sql += '\n';
}

const outputPath = path.join(process.cwd(), 'prisma', 'migration.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Generated: ${outputPath}`);
console.log(`Size: ${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB`);
