-- ============================================================
-- CONTROLE DE GAMIFICAÇÃO – VANESSA AMORIM
-- Execute este script no SQL Editor do Supabase
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO companies (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Vanessa Amorim')
  ON CONFLICT DO NOTHING;

-- app_users (pré-estrutura de permissões)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator'
    CHECK (role IN ('admin','manager','operator','viewer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  hire_date DATE,
  is_active BOOLEAN DEFAULT true,
  avatar_color TEXT DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('collective','individual')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pontos',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reward TEXT,
  reward_value NUMERIC,
  employee_id UUID REFERENCES employees(id),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','completed','cancelled','expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  cpf TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  instagram TEXT,
  referred_by UUID REFERENCES clients(id),
  total_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- point_rules
CREATE TABLE IF NOT EXISTS point_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  rule_type TEXT NOT NULL
    CHECK (rule_type IN ('referral_sent','referral_converted','instagram_post','birthday','procedure','manual','other')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO point_rules (company_id, name, description, points, rule_type) VALUES
  ('00000000-0000-0000-0000-000000000001','Cliente indicou','Cliente que indicou uma amiga',50,'referral_sent'),
  ('00000000-0000-0000-0000-000000000001','Indicação convertida','Indicada fechou procedimento – quem indicou ganha extra',100,'referral_converted'),
  ('00000000-0000-0000-0000-000000000001','Post no Instagram','Cliente postou e marcou a clínica',50,'instagram_post')
ON CONFLICT DO NOTHING;

-- point_transactions
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES point_rules(id),
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('earned','redeemed','expired','manual_add','manual_remove')),
  description TEXT,
  reference_client_id UUID REFERENCES clients(id),
  award_id UUID,
  procedure_id UUID,
  expires_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- procedures
CREATE TABLE IF NOT EXISTS procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  points_required INTEGER,
  redeemable_with_points BOOLEAN DEFAULT false,
  price NUMERIC,
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- awards
CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  award_type TEXT DEFAULT 'product'
    CHECK (award_type IN ('product','procedure','discount','other')),
  stock INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- award_redemptions
CREATE TABLE IF NOT EXISTS award_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  award_id UUID REFERENCES awards(id),
  procedure_id UUID REFERENCES procedures(id),
  points_used INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_by TEXT
);

-- whatsapp_templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('birthday','points_earned','award_reached','points_expiring','general','procedure_done')),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO whatsapp_templates (company_id, name, category, message) VALUES
  ('00000000-0000-0000-0000-000000000001','Parabéns pelo Aniversário','birthday',
   'Olá {{nome_cliente}}! 🎉 A equipe Vanessa Amorim deseja um feliz aniversário! Como presente, você ganhou {{pontos}} pontos. Venha nos visitar! 💛'),
  ('00000000-0000-0000-0000-000000000001','Pontos Ganhos','points_earned',
   'Olá {{nome_cliente}}! Você ganhou {{pontos}} pontos por {{motivo}}. Saldo atual: {{pontos_totais}} pts. Continue assim! 🌟'),
  ('00000000-0000-0000-0000-000000000001','Premiação Conquistada','award_reached',
   'Parabéns {{nome_cliente}}! 🏆 Você conquistou: {{nome_premio}} com {{pontos_totais}} pontos! Entre em contato para resgatar. Vanessa Amorim 💛'),
  ('00000000-0000-0000-0000-000000000001','Pontos Expirando','points_expiring',
   'Olá {{nome_cliente}}! ⚠️ Você tem {{pontos_expirando}} pontos que vencem em {{data_expiracao}}. Não perca! Vanessa Amorim 💛')
ON CONFLICT DO NOTHING;

-- whatsapp_config
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE
    DEFAULT '00000000-0000-0000-0000-000000000001',
  provider TEXT DEFAULT 'none'
    CHECK (provider IN ('none','evolution_api','baileys','official','browser')),
  api_url TEXT,
  api_token TEXT,
  instance_name TEXT,
  phone_number TEXT,
  is_connected BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- employee_goals
CREATE TABLE IF NOT EXISTS employee_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  current_value NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS – Row Level Security
-- ============================================================
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures          ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_goals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_redemptions   ENABLE ROW LEVEL SECURITY;

-- Políticas abertas para anon (ajuste com auth Supabase futuramente)
DO $$ DECLARE t TEXT;
BEGIN FOR t IN SELECT unnest(ARRAY[
  'companies','app_users','employees','clients','point_transactions',
  'awards','procedures','point_rules','goals','whatsapp_templates',
  'whatsapp_config','employee_goals','award_redemptions'
]) LOOP
  EXECUTE format('CREATE POLICY "anon_all" ON %I FOR ALL TO anon USING (true) WITH CHECK (true)', t);
END LOOP; END $$;

-- ============================================================
-- VIEW: client_ranking
-- ============================================================
CREATE OR REPLACE VIEW client_ranking AS
SELECT
  c.id, c.name, c.phone, c.email, c.total_points, c.birth_date,
  RANK() OVER (ORDER BY c.total_points DESC) AS rank_position
FROM clients c
WHERE c.is_active = true;

-- ============================================================
-- VIEW: expiring_points_soon (14 dias)
-- ============================================================
CREATE OR REPLACE VIEW expiring_points_soon AS
SELECT
  c.id AS client_id, c.name AS client_name, c.phone,
  pt.id AS transaction_id, pt.points, pt.expires_at, pt.description
FROM point_transactions pt
JOIN clients c ON c.id = pt.client_id
WHERE
  pt.transaction_type = 'earned'
  AND pt.expired_at IS NULL
  AND pt.redeemed_at IS NULL
  AND pt.expires_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'
ORDER BY pt.expires_at;
