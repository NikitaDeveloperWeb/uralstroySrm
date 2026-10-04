-- ============================================
-- SUPABASE DATABASE SCHEMA
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'MANAGER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT,
  address TEXT,
  type TEXT,
  cost INTEGER,
  deadline TIMESTAMP,
  complexity TEXT,
  status TEXT,
  code TEXT UNIQUE,
  prepayment INTEGER,
  prepayment_date TIMESTAMP,
  unit_rate_id INTEGER,
  brigade_id INTEGER,
  client_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  communication TEXT,
  description TEXT,
  door_type TEXT,
  floors INTEGER,
  foundations TEXT,
  has_mansard BOOLEAN,
  has_porch BOOLEAN,
  has_veranda BOOLEAN,
  insulation TEXT,
  roof_color TEXT,
  roof_type TEXT,
  veranda_size TEXT,
  walls TEXT,
  windows TEXT,
  base_type TEXT,
  home_type TEXT,
  insulation_thickness TEXT,
  layout TEXT,
  roof_material TEXT
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brigades
CREATE TABLE IF NOT EXISTS brigades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id INTEGER NOT NULL,
  member_ids TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date TIMESTAMP NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  hire_date TIMESTAMP NOT NULL,
  workplace TEXT,
  payment_type TEXT,
  employment_type TEXT,
  brigade_id INTEGER,
  hourly_rate_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  monthly_salary INTEGER
);

-- Warehouse Items
CREATE TABLE IF NOT EXISTS warehouse_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER,
  unit TEXT,
  location TEXT,
  last_update TIMESTAMP,
  status TEXT,
  supplier_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cost INTEGER,
  lot_number TEXT,
  price INTEGER
);

-- Warehouse Movements
CREATE TABLE IF NOT EXISTS warehouse_movements (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount INTEGER,
  date TIMESTAMP NOT NULL,
  comment TEXT,
  supplier_id INTEGER,
  project_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Unit Rates
CREATE TABLE IF NOT EXISTS unit_rates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT DEFAULT 'м²',
  price_per_unit FLOAT NOT NULL,
  target_type TEXT DEFAULT 'client',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  client_price FLOAT,
  employee_price FLOAT
);

-- Material Templates
CREATE TABLE IF NOT EXISTS material_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Work Templates
CREATE TABLE IF NOT EXISTS work_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Material Estimates
CREATE TABLE IF NOT EXISTS material_estimates (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  stage TEXT
);

-- Project Overhead Templates
CREATE TABLE IF NOT EXISTS project_overhead_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project Overheads
CREATE TABLE IF NOT EXISTS project_overheads (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Completed Works
CREATE TABLE IF NOT EXISTS completed_works (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  stage TEXT
);

-- Payment Categories
CREATE TABLE IF NOT EXISTS payment_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Funds
CREATE TABLE IF NOT EXISTS funds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fund Transactions
CREATE TABLE IF NOT EXISTS fund_transactions (
  id SERIAL PRIMARY KEY,
  fund_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Reports
CREATE TABLE IF NOT EXISTS project_reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  period_from TIMESTAMP NOT NULL,
  period_to TIMESTAMP NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shop Reports
CREATE TABLE IF NOT EXISTS shop_reports (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  project_id INTEGER,
  date TIMESTAMP NOT NULL,
  period_from TIMESTAMP NOT NULL,
  period_to TIMESTAMP NOT NULL,
  comment TEXT,
  total_amount FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shop Report Items
CREATE TABLE IF NOT EXISTS shop_report_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  work_type_id INTEGER,
  work_name TEXT NOT NULL,
  quantity FLOAT NOT NULL,
  rate FLOAT NOT NULL,
  amount FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employee Work Reports
CREATE TABLE IF NOT EXISTS employee_work_reports (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  project_id INTEGER,
  work_type TEXT NOT NULL,
  quantity FLOAT NOT NULL,
  rate FLOAT NOT NULL,
  amount FLOAT NOT NULL,
  date TIMESTAMP NOT NULL,
  comment TEXT,
  stage TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Finance Reports
CREATE TABLE IF NOT EXISTS finance_reports (
  id SERIAL PRIMARY KEY,
  project_id INTEGER,
  date TIMESTAMP NOT NULL,
  total_income INTEGER NOT NULL,
  total_expense INTEGER NOT NULL,
  profit INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Transactions
CREATE TABLE IF NOT EXISTS project_transactions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  link TEXT,
  date TIMESTAMP NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  project_id INTEGER,
  item_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Financial Plans
CREATE TABLE IF NOT EXISTS financial_plans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  period_from TIMESTAMP NOT NULL,
  period_to TIMESTAMP NOT NULL,
  planned_amount INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  amount INTEGER NOT NULL,
  recipient TEXT NOT NULL,
  purpose TEXT NOT NULL,
  category_id INTEGER,
  category TEXT NOT NULL,
  supplier_id INTEGER,
  project_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Advance Reports
CREATE TABLE IF NOT EXISTS advance_reports (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Advance Report Items
CREATE TABLE IF NOT EXISTS advance_report_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  purpose TEXT,
  date TIMESTAMP DEFAULT NOW()
);

-- EOT Reports
CREATE TABLE IF NOT EXISTS eot_reports (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  total_amount FLOAT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- EOT Report Items
CREATE TABLE IF NOT EXISTS eot_report_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  hours FLOAT,
  rate FLOAT,
  quantity FLOAT,
  work_amount FLOAT,
  salary FLOAT NOT NULL,
  shop_report_id INTEGER,
  comment TEXT
);

-- Penalties
CREATE TABLE IF NOT EXISTS penalties (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bonuses
CREATE TABLE IF NOT EXISTS bonuses (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Salary Reports
CREATE TABLE IF NOT EXISTS salary_reports (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  period TEXT NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Salary Report Items
CREATE TABLE IF NOT EXISTS salary_report_items (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  period TEXT NOT NULL,
  gross_salary INTEGER,
  advances INTEGER,
  penalties INTEGER,
  days INTEGER,
  is_paid BOOLEAN DEFAULT FALSE,
  hours FLOAT,
  shifts INTEGER,
  bonuses INTEGER
);

-- Hourly Rates
CREATE TABLE IF NOT EXISTS hourly_rates (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  rate INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subcontractors
CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  specialization TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tech Equipment
CREATE TABLE IF NOT EXISTS tech_equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  inventory_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'warehouse',
  location TEXT,
  acquisition_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  employee_id INTEGER NOT NULL,
  project_id INTEGER,
  brigade_id INTEGER,
  work_type TEXT,
  hours FLOAT NOT NULL,
  status TEXT DEFAULT 'план',
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Summary Reports
CREATE TABLE IF NOT EXISTS summary_reports (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  period_from TIMESTAMP NOT NULL,
  period_to TIMESTAMP NOT NULL,
  total_income FLOAT,
  total_expense FLOAT,
  profit FLOAT,
  data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee Advances
CREATE TABLE IF NOT EXISTS employee_advances (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  employee_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  settled_amount INTEGER DEFAULT 0,
  date TIMESTAMP NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractors
CREATE TABLE IF NOT EXISTS contractors (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  inn TEXT,
  kpp TEXT,
  bank_name TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractor Contracts
CREATE TABLE IF NOT EXISTS contractor_contracts (
  id SERIAL PRIMARY KEY,
  contractor_id INTEGER NOT NULL,
  contractor_name TEXT NOT NULL,
  contract_number TEXT,
  contract_date TIMESTAMP,
  total_amount INTEGER DEFAULT 0,
  paid_amount INTEGER DEFAULT 0,
  debt_amount INTEGER DEFAULT 0,
  type TEXT DEFAULT 'debt',
  description TEXT,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contractor Payments
CREATE TABLE IF NOT EXISTS contractor_payments (
  id SERIAL PRIMARY KEY,
  contract_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  date TIMESTAMP NOT NULL,
  type TEXT DEFAULT 'payment',
  purpose TEXT,
  recipient TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_brigade_id ON projects(brigade_id);
CREATE INDEX IF NOT EXISTS idx_projects_unit_rate_id ON projects(unit_rate_id);

CREATE INDEX IF NOT EXISTS idx_employees_brigade_id ON employees(brigade_id);
CREATE INDEX IF NOT EXISTS idx_employees_hourly_rate_id ON employees(hourly_rate_id);

CREATE INDEX IF NOT EXISTS idx_warehouse_movements_project_id ON warehouse_movements(project_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_movements_item_id ON warehouse_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_movements_supplier_id ON warehouse_movements(supplier_id);

CREATE INDEX IF NOT EXISTS idx_material_estimates_project_id ON material_estimates(project_id);
CREATE INDEX IF NOT EXISTS idx_project_overheads_project_id ON project_overheads(project_id);
CREATE INDEX IF NOT EXISTS idx_completed_works_project_id ON completed_works(project_id);

CREATE INDEX IF NOT EXISTS idx_fund_transactions_fund_id ON fund_transactions(fund_id);

CREATE INDEX IF NOT EXISTS idx_project_reports_project_id ON project_reports(project_id);

CREATE INDEX IF NOT EXISTS idx_shop_reports_employee_id ON shop_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_shop_reports_project_id ON shop_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_shop_report_items_report_id ON shop_report_items(report_id);

CREATE INDEX IF NOT EXISTS idx_employee_work_reports_employee_id ON employee_work_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_work_reports_project_id ON employee_work_reports(project_id);

CREATE INDEX IF NOT EXISTS idx_finance_reports_project_id ON finance_reports(project_id);

CREATE INDEX IF NOT EXISTS idx_project_transactions_project_id ON project_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_transactions_date ON project_transactions(date);
CREATE INDEX IF NOT EXISTS idx_project_transactions_project_date ON project_transactions(project_id, date);

CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_item_id ON notifications(item_id);

CREATE INDEX IF NOT EXISTS idx_financial_plans_project_id ON financial_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_financial_plans_period ON financial_plans(period_from, period_to);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier_id ON expenses(supplier_id);

CREATE INDEX IF NOT EXISTS idx_advance_reports_date ON advance_reports(date);
CREATE INDEX IF NOT EXISTS idx_advance_report_items_report_id ON advance_report_items(report_id);

CREATE INDEX IF NOT EXISTS idx_eot_reports_date ON eot_reports(date);
CREATE INDEX IF NOT EXISTS idx_eot_report_items_report_id ON eot_report_items(report_id);

CREATE INDEX IF NOT EXISTS idx_penalties_employee_id ON penalties(employee_id);
CREATE INDEX IF NOT EXISTS idx_bonuses_employee_id ON bonuses(employee_id);

CREATE INDEX IF NOT EXISTS idx_salary_reports_date ON salary_reports(date);
CREATE INDEX IF NOT EXISTS idx_salary_report_items_report_id ON salary_report_items(report_id);

CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee_id ON schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON schedules(project_id);

CREATE INDEX IF NOT EXISTS idx_employee_advances_employee_id ON employee_advances(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_advances_date ON employee_advances(date);

CREATE INDEX IF NOT EXISTS idx_contractor_contracts_status ON contractor_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contractor_contracts_contractor_id ON contractor_contracts(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_payments_date ON contractor_payments(date);
CREATE INDEX IF NOT EXISTS idx_contractor_payments_contract_id ON contractor_payments(contract_id);
