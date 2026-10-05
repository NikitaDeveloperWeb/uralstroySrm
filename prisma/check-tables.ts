import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  
  const result = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  
  const existing = result.rows.map((r: any) => r.table_name);
  console.log(`Existing tables (${existing.length}):`);
  existing.forEach(t => console.log(`  ✓ ${t}`));
  
  const allTables = [
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
  
  const missing = allTables.filter(t => !existing.includes(t));
  console.log(`\nMissing tables (${missing.length}):`);
  missing.forEach(t => console.log(`  ✗ ${t}`));
  
  await client.end();
}

main();
