import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const backupDir = path.join(process.cwd(), 'prisma', 'backups');
const files = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
  .sort()
  .reverse();

console.log('=== Checking backup files ===\n');

for (const file of files.slice(0, 5)) {
  const filePath = path.join(backupDir, file);
  const size = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  
  try {
    const db = new Database(filePath, { readonly: true });
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%'").all();
    const tableCount = tables.length;
    
    let totalRecords = 0;
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as c FROM "${table.name}"`).get() as { c: number };
      totalRecords += count.c;
    }
    
    console.log(`${file} (${size} MB):`);
    console.log(`  Tables: ${tableCount}, Records: ${totalRecords}`);
    
    db.close();
  } catch (e) {
    console.log(`${file} (${size} MB): ERROR - ${(e as Error).message}`);
  }
  console.log();
}
