import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const SQLITE_DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

const MODELS = [
  'user', 'project', 'client', 'brigade', 'employee', 'warehouseItem',
  'warehouseMovement', 'unitRate', 'materialTemplate', 'workTemplate',
  'materialEstimate', 'projectOverheadTemplate', 'projectOverhead',
  'completedWork', 'paymentCategory', 'fund', 'fundTransaction',
  'projectReport', 'shopReport', 'shopReportItem', 'employeeWorkReport',
  'financeReport', 'projectTransaction', 'notification', 'financialPlan',
  'expense', 'advanceReport', 'advanceReportItem', 'eotReport',
  'eotReportItem', 'penalty', 'bonus', 'salaryReport', 'salaryReportItem',
  'hourlyRate', 'subcontractor', 'techEquipment', 'supplier', 'schedule',
  'summaryReport', 'document', 'skill', 'expenseCategory', 'employeeAdvance',
  'contractor_contracts', 'contractor_payments', 'contractors',
] as const;

type ModelName = (typeof MODELS)[number];

async function main() {
  console.log('=== SQLite to PostgreSQL Migration ===\n');

  // Step 1: Backup SQLite
  console.log('[1/6] Creating SQLite backup...');
  const BACKUP_DIR = path.join(process.cwd(), 'prisma', 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `pre-migration-${timestamp}.db`);
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(SQLITE_DB_PATH, backupPath);
  console.log(`  -> Backup: ${backupPath}\n`);

  // Step 2: Connect to SQLite
  console.log('[2/6] Opening SQLite database...');
  const sqlite = new Database(SQLITE_DB_PATH, { readonly: true });
  sqlite.pragma('journal_mode = WAL');
  const sqlitePrisma = new PrismaClient({
    datasources: { db: { url: `file:${SQLITE_DB_PATH}` } },
  });
  await sqlitePrisma.$connect();
  console.log('  -> Connected\n');

  // Step 3: Connect to PostgreSQL
  console.log('[3/6] Connecting to PostgreSQL...');
  const pgPrisma = new PrismaClient();
  await pgPrisma.$connect();
  console.log('  -> Connected\n');

  // Step 4: Migrate data
  console.log('[4/6] Migrating data...\n');
  let totalRecords = 0;
  let errors: string[] = [];

  for (const model of MODELS) {
    try {
      const sqliteCount = sqlite.prepare(`SELECT COUNT(*) as count FROM "${model}"`).get() as { count: number };

      if (sqliteCount.count === 0) {
        console.log(`  ${model}: 0 records (skipped)`);
        continue;
      }

      const sqliteRecords = sqlite.prepare(`SELECT * FROM "${model}"`).all() as any[];

      const transformed = sqliteRecords.map((row: any) => {
        const transformedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          if (value === null || value === undefined) {
            transformedRow[key] = value;
          } else if (typeof value === 'string' && key.toLowerCase().includes('date')) {
            const d = new Date(value);
            transformedRow[key] = isNaN(d.getTime()) ? value : d;
          } else {
            transformedRow[key] = value;
          }
        }
        return transformedRow;
      });

      for (const record of transformed) {
        await (pgPrisma as any)[model].create({ data: record });
      }

      totalRecords += transformed.length;
      console.log(`  ${model}: ${sqliteCount.count} records migrated`);
    } catch (e: any) {
      const msg = `  ${model}: ERROR - ${e.message}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  // Step 5: Summary
  console.log('\n[5/6] Migration complete!\n');
  console.log(`  Total records migrated: ${totalRecords}`);
  console.log(`  Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('\n  Error details:');
    errors.forEach(e => console.log(`    ${e}`));
  }
  console.log(`\n  Backup location: ${backupPath}`);

  await sqlitePrisma.$disconnect();
  await pgPrisma.$disconnect();
  sqlite.close();
}

main().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
