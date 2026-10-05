import { Client } from 'pg';

async function tryConnect(i = 0): Promise<void> {
  if (i >= 10) {
    console.log('FAILED');
    process.exit(1);
  }
  try {
    const c = new Client({
      host: 'aws-0-eu-central-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      user: 'postgres.tjillfxmvwnjedbobhoj',
      password: 'tKn-4aB-e87-AgD',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 30000,
    });
    await c.connect();
    console.log(`SUCCESS attempt ${i + 1}`);
    const r = await c.query('SELECT NOW()');
    console.log('Time:', r.rows[0]);
    const t = await c.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'");
    console.log('Tables:', t.rows[0].count);
    await c.end();
    process.exit(0);
  } catch (e: any) {
    console.log(`Attempt ${i + 1} failed:`, e.message);
    setTimeout(() => tryConnect(i + 1), 5000);
  }
}

tryConnect();
