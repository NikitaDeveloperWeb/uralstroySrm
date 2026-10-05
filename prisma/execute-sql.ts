import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function runInsert(sql: string, client: Client): Promise<boolean> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await client.query(sql);
      return true;
    } catch (e: any) {
      if (e.message?.includes('CONFLICT') || e.message?.includes('duplicate')) {
        return true; // already exists
      }
      if (attempt < 4) {
        await sleep(3000);
        try {
          await client.connect();
        } catch {}
      }
    }
  }
  return false;
}

async function main() {
  console.log('=== Executing migration.sql ===\n');
  
  const sqlFile = path.join(process.cwd(), 'prisma', 'migration.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
  
  const statements = sqlContent.split(';')
    .map(s => s.trim())
    .filter(s => s.startsWith('INSERT'));
  
  console.log(`Total INSERT statements: ${statements.length}\n`);
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  console.log('Connected!\n');
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    const ok = await runInsert(stmt, client);
    if (ok) {
      inserted++;
    } else {
      errors++;
    }
    
    if ((i + 1) % 500 === 0) {
      console.log(`Progress: ${i + 1}/${statements.length} (${inserted} ok, ${errors} errors)`);
      await sleep(2000);
    }
  }
  
  await client.end();
  console.log(`\n=== Complete: ${inserted} inserted, ${errors} errors ===`);
}

main().catch(console.error);
