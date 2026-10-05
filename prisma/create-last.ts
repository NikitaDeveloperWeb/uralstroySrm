import { Client } from 'pg';

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function createOne(client: Client, name: string, sql: string): Promise<boolean> {
  for (let i = 0; i < 5; i++) {
    try {
      await client.query(sql);
      console.log(`  ✓ ${name}`);
      return true;
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log(`  - ${name} (exists)`);
        return false;
      }
      if (i < 4) {
        console.log(`  Retry ${i + 1} for ${name}...`);
        await sleep(5000);
      }
    }
  }
  console.log(`  ✗ ${name}: connection lost`);
  return false;
}

async function main() {
  console.log('=== Creating 7 remaining tables ===\n');
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  console.log('Connected!\n');
  
  const tables = [
    ['notifications', `CREATE TABLE IF NOT EXISTS "notifications" (
      id SERIAL PRIMARY KEY, type VARCHAR(255), message TEXT,
      priority VARCHAR(255), link VARCHAR(255), date TIMESTAMP WITH TIME ZONE,
      "isRead" BOOLEAN DEFAULT false, "isArchived" BOOLEAN DEFAULT false,
      "projectId" INTEGER, "itemId" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("itemId") REFERENCES "warehouse_items"(id)
    )`],
    ['contractors', `CREATE TABLE IF NOT EXISTS "contractors" (
      id SERIAL PRIMARY KEY, "companyName" VARCHAR(255),
      "contactPerson" VARCHAR(255), phone VARCHAR(255), email VARCHAR(255),
      address TEXT, inn VARCHAR(255), kpp VARCHAR(255),
      "bankName" VARCHAR(255), "bankAccount" VARCHAR(255),
      status VARCHAR(255) DEFAULT 'active',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`],
    ['contractor_contracts', `CREATE TABLE IF NOT EXISTS "contractor_contracts" (
      id SERIAL PRIMARY KEY, "contractorId" INTEGER,
      "contractorName" VARCHAR(255), "contractNumber" VARCHAR(255),
      "contractDate" TIMESTAMP WITH TIME ZONE,
      "totalAmount" INTEGER DEFAULT 0, "paidAmount" INTEGER DEFAULT 0,
      "debtAmount" INTEGER DEFAULT 0, type VARCHAR(255) DEFAULT 'debt',
      description TEXT, status VARCHAR(255) DEFAULT 'active',
      "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("contractorId") REFERENCES "contractors"(id)
    )`],
    ['contractor_payments', `CREATE TABLE IF NOT EXISTS "contractor_payments" (
      id SERIAL PRIMARY KEY, "contractId" INTEGER,
      amount INTEGER, date TIMESTAMP WITH TIME ZONE,
      type VARCHAR(255) DEFAULT 'payment', purpose TEXT, recipient TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("contractId") REFERENCES "contractor_contracts"(id)
    )`],
    ['_BrigadeSkills', `CREATE TABLE IF NOT EXISTS "_BrigadeSkills" (
      A INTEGER REFERENCES "brigades"(id), B INTEGER REFERENCES "skills"(id),
      PRIMARY KEY (A, B)
    )`],
    ['_EmployeeSkills', `CREATE TABLE IF NOT EXISTS "_EmployeeSkills" (
      A INTEGER REFERENCES "employees"(id), B INTEGER REFERENCES "skills"(id),
      PRIMARY KEY (A, B)
    )`],
    ['_ProjectToSubcontractor', `CREATE TABLE IF NOT EXISTS "_ProjectToSubcontractor" (
      A INTEGER REFERENCES "projects"(id), B INTEGER REFERENCES "subcontractors"(id),
      PRIMARY KEY (A, B)
    )`],
  ];
  
  let created = 0;
  for (const [name, sql] of tables) {
    const ok = await createOne(client, name, sql);
    if (ok) created++;
    await sleep(5000);
  }
  
  await client.end();
  console.log(`\n✓ Created ${created} tables`);
}

main().catch(console.error);
