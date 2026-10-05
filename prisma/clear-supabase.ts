import { Client } from 'pg';

async function withRetry(fn: () => Promise<void>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (e: any) {
      if (i === retries - 1) throw e;
      console.log(`  Retry ${i + 1}...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function main() {
  console.log('=== Dropping all tables from Supabase ===\n');
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await withRetry(() => client.connect());
  
  const result = await withRetry(() => client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name NOT LIKE 'pg_%' AND table_name NOT LIKE 'sql_%'
    ORDER BY table_name
  `));
  
  const tables = result.rows.map((r: any) => r.table_name);
  console.log(`Found ${tables.length} tables\n`);
  
  await withRetry(async () => {
    await client.query('BEGIN');
    try {
      for (const table of tables) {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
      }
      await client.query('COMMIT');
      console.log(`✓ Dropped ${tables.length} tables`);
    } catch (e: any) {
      await client.query('ROLLBACK');
      throw e;
    }
  });
  
  await withRetry(() => client.query(`DROP TYPE IF EXISTS "UserRole" CASCADE`));
  console.log('✓ Dropped UserRole enum');
  
  await client.end();
  console.log('\nDatabase is clean!');
}

main().catch(console.error);
