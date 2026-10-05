import { Client } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';

async function main() {
  console.log('=== Comparing SQLite backup vs PostgreSQL tables ===\n');
  
  // SQLite
  const sqlite = new Database(path.join(process.cwd(), 'prisma', 'backups', 'backup_2026-10-03T08-46-19.db'), { readonly: true });
  const sqliteTables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%' ORDER BY name").all();
  const sqliteTableNames = new Set(sqliteTables.map((t: any) => t.name));
  
  console.log('SQLite tables:');
  sqliteTableNames.forEach((t: string) => console.log(`  - ${t}`));
  
  // PostgreSQL
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'Z7etmjGATdA7Bv2d',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  const pgResult = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  const pgTableNames = new Set(pgResult.rows.map((r: any) => r.table_name));
  
  console.log('\nPostgreSQL tables:');
  pgTableNames.forEach((t: string) => console.log(`  - ${t}`));
  
  // Сравнение
  console.log('\n=== Differences ===');
  
  const missingInPG = [...sqliteTableNames].filter(t => !pgTableNames.has(t));
  const extraInPG = [...pgTableNames].filter(t => !sqliteTableNames.has(t));
  
  if (missingInPG.length) {
    console.log('\n⚠ Missing in PostgreSQL:');
    missingInPG.forEach(t => console.log(`  - ${t}`));
  }
  
  if (extraInPG.length) {
    console.log('\n➕ Extra in PostgreSQL:');
    extraInPG.forEach(t => console.log(`  + ${t}`));
  }
  
  if (!missingInPG.length && !extraInPG.length) {
    console.log('\n✓ Tables match!');
  }
  
  // Проверка колонок для каждой таблицы
  console.log('\n=== Column comparison ===');
  
  for (const tableName of sqliteTableNames) {
    const sqliteCols = sqlite.prepare(`PRAGMA table_info("${tableName}")`).all();
    const sqliteColNames = new Set(sqliteCols.map((c: any) => c.name));
    
    try {
      const pgCols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${tableName}'
      `);
      const pgColNames = new Set(pgCols.rows.map((r: any) => r.column_name));
      
      const missingCols = [...sqliteColNames].filter(c => !pgColNames.has(c));
      const extraCols = [...pgColNames].filter(c => !sqliteColNames.has(c));
      
      if (missingCols.length || extraCols.length) {
        console.log(`\n[${tableName}]`);
        if (missingCols.length) console.log(`  ⚠ Missing: ${missingCols.join(', ')}`);
        if (extraCols.length) console.log(`  ➕ Extra: ${extraCols.join(', ')}`);
      }
    } catch {
      console.log(`\n[${tableName}] - not found in PostgreSQL`);
    }
  }
  
  sqlite.close();
  await client.end();
}

main().catch(console.error);
