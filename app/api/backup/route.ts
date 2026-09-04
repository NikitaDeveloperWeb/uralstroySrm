import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/shared/lib/api-response';
import fs from 'fs';
import path from 'path';

// GET /api/backup - создать резервную копию базы данных
export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(dbPath)) {
      return errorResponse('Файл базы данных не найден', 404);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `backup_${timestamp}.db`;
    const backupPath = path.join(process.cwd(), 'prisma', 'backups', backupName);

    // Создаём директорию для бэкапов
    const backupsDir = path.join(process.cwd(), 'prisma', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    // Копируем файл базы данных
    fs.copyFileSync(dbPath, backupPath);

    // Читаем файл для отправки
    const fileBuffer = fs.readFileSync(backupPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backupName}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return errorResponse('Не удалось создать резервную копию', 500);
  }
}
