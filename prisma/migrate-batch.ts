import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== Batch INSERT migration ===\n');
  
  const dataFile = path.join(process.cwd(), 'prisma', 'dev-data-export.json');
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  
  const BOOLEAN_FIELDS = [
    'is_active', 'is_system', 'is_paid', 'has_veranda', 'has_mansard',
    'has_porch', 'hasPorhCh', 'hasMansard', 'hasVeranda', 'isRead',
  ];
  
  function escapeVal(value: any): string {
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
    return escapeVal(value);
  }
  
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
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  client.on('error', () => {});
  await client.connect();
  console.log('Connected!\n');
  
  let totalInserted = 0;
  
  for (const tableName of TABLE_ORDER) {
    const records = rawData[tableName];
    if (!records || !records.length) continue;
    
    const columns = Object.keys(records[0]);
    const colNames = columns.map(c => `"${c}"`).join(', ');
    
    // Batch INSERTs into groups of 50
    const BATCH_SIZE = 50;
    for (let batchStart = 0; batchStart < records.length; batchStart += BATCH_SIZE) {
      const batch = records.slice(batchStart, batchStart + BATCH_SIZE);
      
      const valuesList = batch.map(record => {
        const values = columns.map(col => {
          const key = col.toLowerCase();
          if (BOOLEAN_FIELDS.includes(key) && typeof record[col] === 'number') {
            return record[col] === 1 ? 'TRUE' : 'FALSE';
          }
          if (col === 'id') return escapeVal(record[col]);
          if (col.includes('Date') || col.includes('date') || col.includes('Time') || col.includes('time') || col === 'createdAt' || col === 'updatedAt' || col === 'date' || col === 'birthDate' || col === 'hireDate' || col === 'deadline' || col === 'lastUpdate' || col === 'periodFrom' || col === 'periodTo' || col === 'contractDate' || col === 'startDate' || col === 'endDate' || col === 'acquisitionDate') {
            return formatDate(record[col]);
          }
          return escapeVal(record[col]);
        });
        return `(${values.join(', ')})`;
      }).join(',\n');
      
      const sql = `INSERT INTO "${tableName}" (${colNames}) VALUES ${valuesList} ON CONFLICT DO NOTHING`;
      
      let attempt = 0;
      let success = false;
      while (attempt < 5 && !success) {
        try {
          await client.query(sql);
          success = true;
        } catch (e: any) {
          if (e.message?.includes('CONFLICT') || e.message?.includes('duplicate')) {
            success = true;
          } else {
            attempt++;
            if (attempt < 5) {
              await sleep(3000);
              try { await client.connect(); } catch {}
            }
          }
        }
      }
      
      totalInserted += batch.length;
    }
    
    console.log(`  ✓ ${tableName}: ${records.length} records`);
    await sleep(2000);
  }
  
  await client.end();
  console.log(`\n=== Complete: ${totalInserted} records ===`);
}

main().catch(console.error);
