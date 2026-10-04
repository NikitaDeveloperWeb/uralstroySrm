import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
const BACKUP_DIR = path.join(process.cwd(), 'prisma', 'backups');

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ База данных не найдена:', DB_PATH);
  process.exit(1);
}

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.db`);

console.log('Создание резервной копии...');
console.log('Источник:', DB_PATH);
console.log('Цель:', backupFile);

try {
  fs.copyFileSync(DB_PATH, backupFile);
  const size = (fs.statSync(backupFile).size / 1024 / 1024).toFixed(2);
  console.log(`✓ Бэкап создан: ${backupFile} (${size} МБ)`);
} catch (error) {
  console.error('❌ Ошибка:', error);
  process.exit(1);
}
