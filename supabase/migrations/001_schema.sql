-- =============================================
-- UNERGY VECINOS — Schema inicial
-- Ejecutar en: Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ COMPANIES ============
CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  nit         VARCHAR(50)  UNIQUE NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============ UGRANJAS ============
CREATE TABLE IF NOT EXISTS ugranjas (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(255) NOT NULL,
  location             VARCHAR(255),
  location_map_url     TEXT,
  photo_url            TEXT,
  connected_people     INTEGER DEFAULT 0,
  generated_energy_kwh NUMERIC(14,2) DEFAULT 0,
  avoided_co2_kg       NUMERIC(14,2) DEFAULT 0,
  saved_trees          INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============ BRANCHES (SEDES) ============
CREATE TABLE IF NOT EXISTS branches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        UUID REFERENCES companies(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  city              VARCHAR(100) NOT NULL,
  opening_date      DATE,
  nit               VARCHAR(50),
  unergy_subscribed BOOLEAN DEFAULT FALSE,
  ugranja_id        UUID REFERENCES ugranjas(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INVOICES (FACTURAS) ============
CREATE TABLE IF NOT EXISTS invoices (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id              UUID REFERENCES branches(id) ON DELETE CASCADE,
  status                 VARCHAR(20) NOT NULL CHECK (status IN ('Pagada', 'Pendiente', 'Vencida')),
  energy_marketer        VARCHAR(255) NOT NULL,
  invoice_number         VARCHAR(100) UNIQUE NOT NULL,
  issue_date             DATE NOT NULL,
  contract_number        VARCHAR(100),
  due_date               DATE NOT NULL,
  billing_period_start   DATE NOT NULL,
  billing_period_end     DATE NOT NULL,
  total_kwh_consumption  NUMERIC(12,2) NOT NULL,
  standard_kwh_rate      NUMERIC(10,2) NOT NULL,
  unergy_kwh_rate        NUMERIC(10,2),
  unergy_kwh_consumed    NUMERIC(12,2),
  created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch ON invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugranjas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches   ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices   ENABLE ROW LEVEL SECURITY;

-- Policies: allow authenticated users to read all (MVP)
CREATE POLICY "Allow authenticated read" ON companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON ugranjas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON branches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read" ON invoices
  FOR SELECT TO authenticated USING (true);
