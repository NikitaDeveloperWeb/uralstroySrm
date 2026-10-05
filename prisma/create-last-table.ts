import { Client } from 'pg';

async function main() {
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS "_ProjectToSubcontractor" (
      A INTEGER REFERENCES "projects"(id),
      B INTEGER REFERENCES "subcontractors"(id),
      PRIMARY KEY (A, B)
    )`);
    console.log('✓ _ProjectToSubcontractor created');
  } catch (e: any) {
    console.log(e.message);
  }
  
  await client.end();
}

main();
