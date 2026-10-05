import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import path from 'path';

const BACKUP = path.join(process.cwd(), 'prisma', 'backups', 'backup_2026-10-03T08-46-19.db');
const sqlite = new Database(BACKUP, { readonly: true });

const pgPrisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://postgres.tjillfxmvwnjedbobhoj:Z7etmjGATdA7Bv2d@aws-0-eu-central-2.pooler.supabase.com:5432/postgres' }
  }
});

const BOOLEAN_FIELDS = ['is_active', 'is_system', 'is_paid', 'has_veranda', 'has_mansard', 'has_porch',
  'hasPorhch', 'hasMansard', 'hasVeranda', 'is_valid', 'is_completed', 'is_approved',
  'status', 'type', 'category', 'active', 'enabled', 'confirmed', 'verified', 'isRead'];

function transformValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  
  if (BOOLEAN_FIELDS.includes(key) && typeof value === 'number') {
    return value === 1;
  }
  
  if (typeof value === 'number') {
    if (value > 946684800000) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return value;
  }
  
  return value;
}

async function migrateTable(tableName: string, modelName: string) {
  try {
    const count = sqlite.prepare(`SELECT COUNT(*) as c FROM "${tableName}"`).get() as { c: number };
    if (count.c === 0) return;
    
    const records = sqlite.prepare(`SELECT * FROM "${tableName}"`).all() as any[];
    let migrated = 0;
    let skipped = 0;
    
    console.log(`\n[${tableName}] ${records.length} records...`);
    
    for (const record of records) {
      try {
        const transformed: Record<string, any> = {};
        for (const [key, value] of Object.entries(record)) {
          transformed[key] = transformValue(key, value);
        }
        
        // Удаляем поля, которые могут вызывать конфликты
        delete transformed.id;
        
        await (pgPrisma as any)[modelName].create({ data: transformed });
        migrated++;
      } catch (e: any) {
        if (!e.message.includes('Unique constraint')) {
          skipped++;
          if (skipped <= 2) {
            console.log(`  SKIP: ${e.message?.split('\n')[0]?.substring(0, 100)}`);
          }
        }
      }
    }
    
    console.log(`  ✓ ${migrated} migrated, ${skipped} skipped`);
  } catch (e: any) {
    console.log(`  ✗ Error: ${(e as Error).message?.substring(0, 80)}`);
  }
}

async function main() {
  console.log('=== Migrating data from SQLite backup to PostgreSQL ===\n');
  
  await pgPrisma.$connect();
  
  const tables: Array<[string, string]> = [
    ['users', 'user'],
    ['clients', 'client'],
    ['brigades', 'brigade'],
    ['employees', 'employee'],
    ['unit_rates', 'unitRate'],
    ['projects', 'project'],
    ['suppliers', 'supplier'],
    ['warehouse_items', 'warehouseItem'],
    ['warehouse_movements', 'warehouseMovement'],
    ['material_estimates', 'materialEstimate'],
    ['project_overheads', 'projectOverhead'],
    ['completed_works', 'completedWork'],
    ['project_transactions', 'projectTransaction'],
    ['expenses', 'expense'],
    ['advance_reports', 'advanceReport'],
    ['advance_report_items', 'advanceReportItem'],
    ['eot_reports', 'eotReport'],
    ['eot_report_items', 'eotReportItem'],
    ['bonuses', 'bonus'],
    ['salary_reports', 'salaryReport'],
    ['salary_report_items', 'salaryReportItem'],
    ['hourly_rates', 'hourlyRate'],
    ['subcontractors', 'subcontractor'],
    ['tech_equipment', 'techEquipment'],
    ['schedules', 'schedule'],
    ['documents', 'document'],
    ['skills', 'skill'],
    ['expense_categories', 'expenseCategory'],
    ['employee_advances', 'employeeAdvance'],
    ['project_overhead_templates', 'projectOverheadTemplate'],
    ['material_templates', 'materialTemplate'],
    ['work_templates', 'workTemplate'],
    ['payment_categories', 'paymentCategory'],
    ['funds', 'fund'],
    ['fund_transactions', 'fundTransaction'],
    ['project_reports', 'projectReport'],
    ['shop_reports', 'shopReport'],
    ['shop_report_items', 'shopReportItem'],
    ['employee_work_reports', 'employeeWorkReport'],
    ['finance_reports', 'financeReport'],
    ['financial_plans', 'financialPlan'],
    ['notifications', 'notification'],
  ];
  
  for (const [table, model] of tables) {
    await migrateTable(table, model);
  }
  
  console.log('\n=== Migration Complete ===');
  await pgPrisma.$disconnect();
}

main().catch(console.error);
