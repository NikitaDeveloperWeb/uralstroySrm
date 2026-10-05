import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

let gClient: Client | null = null;

async function getConnectedClient(): Promise<Client> {
  if (gClient) {
    try {
      await gClient.query('SELECT 1');
      return gClient;
    } catch {
      gClient = null;
    }
  }
  
  console.log('  Connecting...');
  await sleep(2000);
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  client.on('error', () => {
    // ignore
  });
  
  await client.connect();
  gClient = client;
  console.log('  Connected!');
  return client;
}

async function insertTable(tableName: string, records: any[]): Promise<{ ok: number; skip: number }> {
  if (!records.length) return { ok: 0, skip: 0 };
  
  const columns = Object.keys(records[0]);
  const colNames = columns.map(c => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(',');
  const sql = `INSERT INTO "${tableName}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
  
  let ok = 0, skip = 0;
  let lastError = '';
  
  for (let i = 0; i < records.length; i++) {
    const client = await getConnectedClient();
    
    try {
      const values = columns.map(col => {
        const v = records[i][col];
        if (v === null || v === undefined) return null;
        if (typeof v === 'boolean') return v;
        if (typeof v === 'number') return v;
        return String(v);
      });
      await client.query(sql, values);
      ok++;
    } catch (e: any) {
      skip++;
      lastError = e.message?.substring(0, 50);
    }
    
    if ((i + 1) % 100 === 0) {
      console.log(`    ${i + 1}/${records.length}...`);
    }
  }
  
  return { ok, skip };
}

async function main() {
  console.log('=== Migrating data to PostgreSQL ===\n');
  
  const dataFile = path.join(process.cwd(), 'prisma', 'dev-data-export.json');
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  
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
  
  let totalInserted = 0, totalSkipped = 0;
  
  for (const tableName of TABLE_ORDER) {
    const records = rawData[tableName];
    if (!records || !records.length) continue;
    
    console.log(`\n[${tableName}] ${records.length} records...`);
    
    const { ok, skip } = await insertTable(tableName, records);
    totalInserted += ok;
    totalSkipped += skip;
    console.log(`  ✓ ${ok} inserted, ${skip} skipped`);
    
    await sleep(1000);
  }
  
  // Handle tables not in order
  for (const [tableName, records] of Object.entries(rawData)) {
    if (TABLE_ORDER.includes(tableName)) continue;
    if (records && records.length) {
      console.log(`\n[${tableName}] ${records.length} records...`);
      const { ok, skip } = await insertTable(tableName, records);
      totalInserted += ok;
      totalSkipped += skip;
      console.log(`  ✓ ${ok} inserted, ${skip} skipped`);
      await sleep(1000);
    }
  }
  
  if (gClient) await gClient.end();
  console.log(`\n=== Complete: ${totalInserted} inserted, ${totalSkipped} skipped ===`);
}

main().catch(console.error);
