import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function insertTable(tableName: string, records: any[], existingIds: Set<string>): Promise<{ ok: number; skip: number; errors: number }> {
  if (!records.length) return { ok: 0, skip: 0, errors: 0 };
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  client.on('error', () => {});
  
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await client.connect();
      break;
    } catch (e: any) {
      if (attempt === 4) throw e;
      await sleep(5000 * (attempt + 1));
    }
  }
  
  const columns = Object.keys(records[0]);
  const colNames = columns.map(c => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
  const sql = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
  
  let ok = 0, skip = 0, errors = 0;
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    // Skip if ID already exists
    if (record.id && existingIds.has(String(record.id))) {
      skip++;
      continue;
    }
    
    try {
      const values = columns.map(col => {
        const v = record[col];
        if (v === null || v === undefined) return null;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v;
        return String(v);
      });
      await client.query(sql, values);
      ok++;
    } catch (e: any) {
      errors++;
    }
    
    if ((i + 1) % 50 === 0) {
      console.log(`    ${i + 1}/${records.length}...`);
    }
  }
  
  await client.end();
  return { ok, skip, errors };
}

async function main() {
  console.log('=== Continuing migration ===\n');
  
  const dataFile = path.join(process.cwd(), 'prisma', 'dev-data-export.json');
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  
  // Check what's already in PostgreSQL
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
  
  const TABLE_ORDER = [
    'skills', 'expense_categories', 'payment_categories',
    'hourly_rates', 'material_templates', 'work_templates',
    'project_overhead_templates', 'brigades', 'employees', 'unit_rates',
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
  
  let totalInserted = 0;
  
  for (const tableName of TABLE_ORDER) {
    const records = rawData[tableName];
    if (!records || !records.length) continue;
    
    // Get existing IDs
    let existingIds = new Set<string>();
    try {
      const result = await client.query(`SELECT id FROM "${tableName}"`);
      existingIds = new Set(result.rows.map((r: any) => String(r.id)));
    } catch {
      // table might not exist or other error
    }
    
    console.log(`\n[${tableName}] ${records.length} records, ${existingIds.size} already exist`);
    
    const { ok, skip, errors } = await insertTable(tableName, records, existingIds);
    totalInserted += ok;
    
    console.log(`  ✓ ${ok} inserted, ${skip} skipped (conflict), ${errors} errors`);
    
    await sleep(10000); // 10 second pause between tables
  }
  
  await client.end();
  console.log(`\n=== Complete: ${totalInserted} records inserted ===`);
}

main().catch(console.error);
