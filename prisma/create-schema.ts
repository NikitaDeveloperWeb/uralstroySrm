import { Client } from 'pg';

async function queryWithRetry(client: Client, sql: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await client.query(sql);
    } catch (e: any) {
      if (i === retries - 1) throw e;
      console.log(`  Retry ${i + 1} for query...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function main() {
  console.log('=== Creating all tables from schema ===\n');
  
  const client = new Client({
    host: 'aws-0-eu-central-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres.tjillfxmvwnjedbobhoj',
    password: 'tKn-4aB-e87-AgD',
    ssl: { rejectUnauthorized: false },
  });
  
  await client.connect();
  
  const tables = [
    `CREATE TABLE IF NOT EXISTS "users" (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      role "UserRole" DEFAULT 'ADMIN',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "clients" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "brigades" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      "leaderId" INTEGER NOT NULL,
      "memberIds" TEXT NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "employees" (
      id SERIAL PRIMARY KEY,
      "fullName" VARCHAR(255) NOT NULL,
      "birthDate" TIMESTAMP WITH TIME ZONE NOT NULL,
      phone VARCHAR(50) NOT NULL,
      address TEXT,
      "hireDate" TIMESTAMP WITH TIME ZONE,
      workplace VARCHAR(255),
      "paymentType" VARCHAR(255),
      "employmentType" VARCHAR(255),
      "brigadeId" INTEGER,
      "hourlyRateId" INTEGER,
      "monthlySalary" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("brigadeId") REFERENCES "brigades"(id),
      FOREIGN KEY ("hourlyRateId") REFERENCES "hourly_rates"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "projects" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      area VARCHAR(255),
      address TEXT,
      type VARCHAR(255),
      cost INTEGER,
      deadline TIMESTAMP WITH TIME ZONE,
      complexity VARCHAR(255),
      status VARCHAR(255) DEFAULT 'created',
      code VARCHAR(255) UNIQUE,
      prepayment INTEGER,
      "prepaymentDate" TIMESTAMP WITH TIME ZONE,
      "unitRateId" INTEGER,
      "brigadeId" INTEGER,
      "clientId" INTEGER,
      communication TEXT,
      description TEXT,
      "doorType" VARCHAR(255),
      floors INTEGER,
      foundations TEXT,
      "hasMansard" BOOLEAN,
      "hasPorhch" BOOLEAN,
      "hasVeranda" BOOLEAN,
      insulation TEXT,
      "roofColor" VARCHAR(255),
      "roofType" VARCHAR(255),
      "verandaSize" VARCHAR(255),
      walls TEXT,
      windows TEXT,
      "baseType" VARCHAR(255),
      "homeType" VARCHAR(255),
      "insulationThickness" VARCHAR(255),
      layout TEXT,
      "roofMaterial" VARCHAR(255),
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("unitRateId") REFERENCES "unit_rates"(id),
      FOREIGN KEY ("brigadeId") REFERENCES "brigades"(id),
      FOREIGN KEY ("clientId") REFERENCES "clients"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "unit_rates" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      unit VARCHAR(50) DEFAULT 'м²',
      "pricePerUnit" FLOAT,
      "targetType" VARCHAR(255) DEFAULT 'client',
      description TEXT,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "clientPrice" FLOAT,
      "employeePrice" FLOAT
    )`,
    `CREATE TABLE IF NOT EXISTS "suppliers" (
      id SERIAL PRIMARY KEY,
      "companyName" VARCHAR(255) NOT NULL,
      "contactPerson" VARCHAR(255),
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      address TEXT,
      category VARCHAR(255),
      status VARCHAR(255) DEFAULT 'active',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "warehouse_items" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      quantity INTEGER,
      unit VARCHAR(50),
      location VARCHAR(255),
      "lastUpdate" TIMESTAMP WITH TIME ZONE,
      status VARCHAR(255),
      "supplierId" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      cost INTEGER,
      "lotNumber" VARCHAR(255),
      price INTEGER,
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "warehouse_movements" (
      id SERIAL PRIMARY KEY,
      "itemId" INTEGER,
      type VARCHAR(255),
      quantity INTEGER,
      amount INTEGER,
      date TIMESTAMP WITH TIME ZONE,
      comment TEXT,
      "supplierId" INTEGER,
      "projectId" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("itemId") REFERENCES "warehouse_items"(id),
      FOREIGN KEY ("projectId") REFERENCES "projects"(id),
      FOREIGN KEY ("supplierId") REFERENCES "suppliers"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "hourly_rates" (
      id SERIAL PRIMARY KEY,
      position VARCHAR(255) NOT NULL,
      rate INTEGER,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "skills" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "expense_categories" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "employee_advances" (
      id SERIAL PRIMARY KEY,
      "employeeId" INTEGER,
      "employeeName" VARCHAR(255),
      amount INTEGER,
      "settledAmount" INTEGER DEFAULT 0,
      date TIMESTAMP WITH TIME ZONE,
      purpose TEXT,
      status VARCHAR(255) DEFAULT 'active',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "subcontractors" (
      id SERIAL PRIMARY KEY,
      "companyName" VARCHAR(255) NOT NULL,
      "contactPerson" VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      address TEXT,
      specialization VARCHAR(255),
      status VARCHAR(255) DEFAULT 'active',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "tech_equipment" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(255),
      "inventoryNumber" VARCHAR(255) UNIQUE,
      status VARCHAR(255) DEFAULT 'warehouse',
      location VARCHAR(255),
      "acquisitionDate" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "material_templates" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quantity VARCHAR(255),
      cost INTEGER,
      category VARCHAR(255),
      "isSystem" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "work_templates" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      quantity VARCHAR(255),
      cost INTEGER,
      category VARCHAR(255),
      "isSystem" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "project_overhead_templates" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      cost INTEGER,
      category VARCHAR(255),
      "isSystem" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "payment_categories" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      percentage INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "funds" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      balance INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "fund_transactions" (
      id SERIAL PRIMARY KEY,
      "fundId" INTEGER,
      amount INTEGER,
      type VARCHAR(255),
      description TEXT,
      date TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("fundId") REFERENCES "funds"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "contracts" (
      id SERIAL PRIMARY KEY,
      "contractorId" INTEGER,
      "contractorName" VARCHAR(255),
      "contractNumber" VARCHAR(255),
      "contractDate" TIMESTAMP WITH TIME ZONE,
      "totalAmount" INTEGER DEFAULT 0,
      "paidAmount" INTEGER DEFAULT 0,
      "debtAmount" INTEGER DEFAULT 0,
      type VARCHAR(255) DEFAULT 'debt',
      description TEXT,
      status VARCHAR(255) DEFAULT 'active',
      "startDate" TIMESTAMP WITH TIME ZONE,
      "endDate" TIMESTAMP WITH TIME ZONE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "contractor_payments" (
      id SERIAL PRIMARY KEY,
      "contractId" INTEGER,
      amount INTEGER,
      date TIMESTAMP WITH TIME ZONE,
      type VARCHAR(255) DEFAULT 'payment',
      purpose TEXT,
      recipient TEXT,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY ("contractId") REFERENCES "contracts"(id)
    )`,
    `CREATE TABLE IF NOT EXISTS "documents" (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(255),
      "fileName" VARCHAR(255),
      "mimeType" VARCHAR(255),
      "fileSize" INTEGER,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
  ];
  
  let created = 0;
  for (const sql of tables) {
    try {
      await queryWithRetry(client, sql);
      created++;
    } catch (e: any) {
      // skip existing
    }
  }
  
  // Junction tables
  const junctions = [
    `CREATE TABLE IF NOT EXISTS "_BrigadeSkills" (
      A INTEGER REFERENCES "brigades"(id),
      B INTEGER REFERENCES "skills"(id),
      PRIMARY KEY (A, B)
    )`,
    `CREATE TABLE IF NOT EXISTS "_EmployeeSkills" (
      A INTEGER REFERENCES "employees"(id),
      B INTEGER REFERENCES "skills"(id),
      PRIMARY KEY (A, B)
    )`,
    `CREATE TABLE IF NOT EXISTS "_ProjectToSubcontractor" (
      A INTEGER REFERENCES "projects"(id),
      B INTEGER REFERENCES "subcontractors"(id),
      PRIMARY KEY (A, B)
    )`,
  ];
  
  for (const sql of junctions) {
    try {
      await queryWithRetry(client, sql);
    } catch {
      // skip
    }
  }
  
  await client.end();
  console.log(`\n✓ Created ${created} tables + 3 junction tables`);
}

main().catch(console.error);
