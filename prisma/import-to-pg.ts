import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const BOOLEAN_FIELDS = ['is_active', 'is_system', 'is_paid', 'has_veranda', 'has_mansard', 'has_porch',
  'hasPorhCh', 'hasMansard', 'hasVeranda', 'is_valid', 'is_completed', 'is_approved', 'isRead'];

function transformValue(key: string, value: any): any {
  if (value === null || value === undefined) return value;
  if (BOOLEAN_FIELDS.includes(key) && typeof value === 'number') return value === 1;
  if (typeof value === 'number' && value > 946684800000) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

function createClient(): Client {
  return new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'Z7etmjGATdA7Bv2d',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
  });
}

async function main() {
  console.log('=== Import data to PostgreSQL ===\n');
  
  const dataFile = path.join(process.cwd(), 'prisma', 'data-export.json');
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  
  let totalInserted = 0;
  let totalSkipped = 0;
  
  for (const [table, records] of Object.entries(rawData)) {
    const typedRecords = records as any[];
    console.log(`\n[${table}] ${typedRecords.length} records...`);
    
    if (!typedRecords.length) continue;
    
    // Создаём новый клиент для каждой таблицы
    const client = createClient();
    let retries = 0;
    
    while (retries < 3) {
      try {
        await client.connect();
        break;
      } catch (e: any) {
        retries++;
        console.log(`  Connect retry ${retries}/3...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    const columns = Object.keys(typedRecords[0]);
    const values = columns.map((_, i) => `$${i + 1}`).join(',');
    const sql = `INSERT INTO "${table}" VALUES (${values}) ON CONFLICT DO NOTHING`;
    
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < typedRecords.length; i++) {
      try {
        const valuesArr = columns.map(col => transformValue(col, typedRecords[i][col]));
        await client.query(sql, valuesArr);
        inserted++;
      } catch {
        skipped++;
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`  ${i + 1}/${typedRecords.length}...`);
      }
    }
    
    await client.end();
    
    totalInserted += inserted;
    totalSkipped += skipped;
    console.log(`  ✓ ${inserted} inserted, ${skipped} skipped`);
    
    if (typedRecords.length > 0) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\n=== Complete: ${totalInserted} inserted, ${totalSkipped} skipped ===`);
}

main().catch(console.error);
