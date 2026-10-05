import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'prisma', 'dev.db'), { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%' ORDER BY name").all();

console.log('=== Tables in dev.db ===\n');

let totalRecords = 0;
for (const table of tables) {
  const count = db.prepare(`SELECT COUNT(*) as c FROM "${table.name}"`).get() as { c: number };
  totalRecords += count.c;
  console.log(`  ${table.name}: ${count.c}`);
}

console.log(`\nTotal: ${totalRecords} records in ${tables.length} tables`);
db.close();
