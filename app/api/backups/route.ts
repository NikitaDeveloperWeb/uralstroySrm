import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'prisma', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }
    
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
      .map(f => ({
        filename: f,
        size: fs.statSync(path.join(backupDir, f)).size,
        date: fs.statSync(path.join(backupDir, f)).mtime,
        url: `/api/backups/download/${f}`
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return NextResponse.json({ backups: files });
  } catch (error) {
    console.error('Backups list error:', error);
    return NextResponse.json({ backups: [] });
  }
}
