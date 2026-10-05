import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const backupDir = path.join(process.cwd(), 'prisma', 'backups');
const files = fs.readdirSync(backupDir)
  .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
  .sort();

console.log('=== Scanning all backups ===\n');

let bestBackup = null;
let maxRecords = 0;

for (const file of files) {
  const filePath = path.join(backupDir, file);
  const size = fs.statSync(filePath).size;
  
  if (size < 100000) continue; // skip tiny files
  
  try {
    const db = new Database(filePath, { readonly: true });
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_%'").all();
    
    let totalRecords = 0;
    for (const table of tables) {
      const count = db.prepare(`SELECT COUNT(*) as c FROM "${table.name}"`).get() as { c: number };
      totalRecords += count.c;
    }
    
    db.close();
    
    if (totalRecords > maxRecords) {
      maxRecords = totalRecords;
      bestBackup = file;
    }
    
    if (totalRecords > 0) {
      console.log(`${file} (${(size/1024).toFixed(1)} KB): ${tables.length} tables, ${totalRecords} records`);
    }
  } catch (e) {
    // skip
  }
}

if (bestBackup) {
  console.log(`\n✓ Best backup: ${bestBackup} (${maxRecords} records)`);
} else {
  console.log('\n✗ No backup with data found!');
}
