import { NextResponse } from 'next/server';

// GET /api/backup - File-based backups removed.
// Supabase provides built-in backups and point-in-time recovery.
// To manually backup: use Supabase dashboard or pg_dump.
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'File-based backups removed. Use Supabase dashboard for database backups.' },
    { status: 410 }
  );
}
