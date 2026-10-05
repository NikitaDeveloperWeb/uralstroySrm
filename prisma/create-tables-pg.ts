import { Pool } from 'pg';

const pool = new Pool({
  host: 'aws-0-eu-central-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.tjillfxmvwnjedbobhoj',
  password: 'Z7etmjGATdA7Bv2d',
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS "users" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'ADMIN',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "clients" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "brigades" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  leaderId INTEGER NOT NULL,
  memberIds TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "employees" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brigadeId INTEGER,
  hireDate TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (brigadeId) REFERENCES brigades(id)
);

CREATE TABLE IF NOT EXISTS "projects" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  address TEXT,
  type VARCHAR(255),
  cost INTEGER,
  deadline TIMESTAMP WITH TIME ZONE,
  complexity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'created',
  code VARCHAR(50) UNIQUE,
  prepayment INTEGER,
  prepaymentDate TIMESTAMP WITH TIME ZONE,
  unitRateId INTEGER,
  brigadeId INTEGER,
  clientId INTEGER,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  communication TEXT,
  description TEXT,
  doorType VARCHAR(50),
  floors INTEGER,
  foundations TEXT,
  hasMansard BOOLEAN,
  hasPorhch BOOLEAN,
  hasVeranda BOOLEAN,
  insulation TEXT,
  roofColor VARCHAR(50),
  roofType VARCHAR(50),
  verandaSize VARCHAR(50),
  walls TEXT,
  windows TEXT,
  baseType VARCHAR(50),
  homeType VARCHAR(50),
  insulationThickness VARCHAR(50),
  layout TEXT,
  roofMaterial VARCHAR(50),
  FOREIGN KEY (unitRateId) REFERENCES unit_rates(id),
  FOREIGN KEY (brigadeId) REFERENCES brigades(id),
  FOREIGN KEY (clientId) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS "unit_rates" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  description TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "hourly_rates" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employeeId, date)
);

CREATE TABLE IF NOT EXISTS "bonuses" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "expenses" (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  purpose TEXT,
  category VARCHAR(255),
  projectId INTEGER,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "advance_reports" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  totalAmount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "advance_report_items" (
  id SERIAL PRIMARY KEY,
  advanceReportId INTEGER NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (advanceReportId) REFERENCES advance_reports(id)
);

CREATE TABLE IF NOT EXISTS "completed_works" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  workDate TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  volume DECIMAL(10,2),
  amount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "schedules" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  employeeId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  hours DECIMAL(5,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "warehouse_items" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "warehouse_movements" (
  id SERIAL PRIMARY KEY,
  warehouseItemId INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (warehouseItemId) REFERENCES warehouse_items(id)
);

CREATE TABLE IF NOT EXISTS "suppliers" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "skills" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "expense_categories" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "employee_advances" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "subcontractors" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contractNumber VARCHAR(100),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "eot_reports" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  days DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "eot_report_items" (
  id SERIAL PRIMARY KEY,
  eotReportId INTEGER NOT NULL,
  description TEXT,
  days DECIMAL(5,2),
  amount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (eotReportId) REFERENCES eot_reports(id)
);

CREATE TABLE IF NOT EXISTS "salary_reports" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  periodStart TIMESTAMP WITH TIME ZONE NOT NULL,
  periodEnd TIMESTAMP WITH TIME ZONE NOT NULL,
  totalAmount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'draft',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "salary_report_items" (
  id SERIAL PRIMARY KEY,
  salaryReportId INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (salaryReportId) REFERENCES salary_reports(id)
);

CREATE TABLE IF NOT EXISTS "project_transactions" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  comment TEXT,
  type VARCHAR(50),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "documents" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "project_overheads" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(255),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "material_estimates" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unitPrice DECIMAL(10,2),
  totalAmount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "project_overhead_templates" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  defaultAmount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "material_templates" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  defaultPrice DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "work_templates" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  defaultRate DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "payment_categories" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "funds" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "fund_transactions" (
  id SERIAL PRIMARY KEY,
  fundId INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (fundId) REFERENCES funds(id)
);

CREATE TABLE IF NOT EXISTS "project_reports" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "shop_reports" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "shop_report_items" (
  id SERIAL PRIMARY KEY,
  shopReportId INTEGER NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2),
  amount DECIMAL(10,2),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (shopReportId) REFERENCES shop_reports(id)
);

CREATE TABLE IF NOT EXISTS "employee_work_reports" (
  id SERIAL PRIMARY KEY,
  employeeId INTEGER NOT NULL,
  projectId INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  hours DECIMAL(5,2),
  description TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (employeeId) REFERENCES employees(id),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "finance_reports" (
  id SERIAL PRIMARY KEY,
  periodStart TIMESTAMP WITH TIME ZONE NOT NULL,
  periodEnd TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "financial_plans" (
  id SERIAL PRIMARY KEY,
  projectId INTEGER,
  category VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  periodStart TIMESTAMP WITH TIME ZONE,
  periodEnd TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (projectId) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS "notifications" (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS "tech_equipment" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255),
  status VARCHAR(50),
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "summary_reports" (
  id SERIAL PRIMARY KEY,
  periodStart TIMESTAMP WITH TIME ZONE NOT NULL,
  periodEnd TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "_BrigadeSkills" (
  A INTEGER REFERENCES brigades(id),
  B INTEGER REFERENCES skills(id),
  PRIMARY KEY (A, B)
);

CREATE TABLE IF NOT EXISTS "_EmployeeSkills" (
  A INTEGER REFERENCES employees(id),
  B INTEGER REFERENCES skills(id),
  PRIMARY KEY (A, B)
);

CREATE TABLE IF NOT EXISTS "_ProjectToSubcontractor" (
  A INTEGER REFERENCES projects(id),
  B INTEGER REFERENCES subcontractors(id),
  PRIMARY KEY (A, B)
);
`;

async function main() {
  console.log('Creating tables in Supabase...\n');
  
  try {
    await pool.query('BEGIN');
    const queries = sql.split(';').filter(q => q.trim().length > 0);
    
    let created = 0;
    for (const query of queries) {
      try {
        await pool.query(query.trim());
        created++;
      } catch (e) {
        console.log('  - Error:', e.message?.substring(0, 80));
      }
    }
    
    await pool.query('COMMIT');
    console.log(`✓ Created ${created} tables`);
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('✗ Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
