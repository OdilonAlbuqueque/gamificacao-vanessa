-- ============================================================
-- admin_users — Gestão MAX
-- Execute no SQL Editor do Supabase
-- sha256('123456') = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
-- ============================================================

-- 1. Cria a tabela se não existir
CREATE TABLE IF NOT EXISTS admin_users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  username             TEXT NOT NULL,
  display_name         TEXT,
  password_hash        TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  role                 TEXT NOT NULL DEFAULT 'operator', -- admin | manager | operator | viewer
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (company_id, username)
);

-- 2. RLS — permite leitura/escrita pela chave anon (necessário para login no frontend)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_users_open" ON admin_users;
CREATE POLICY "admin_users_open" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. Usuários padrão (UPSERT — corrige hash se estava errado)
-- Senha inicial: 123456 | No 1º login o sistema exige troca
-- ============================================================

-- Admin (acesso total)
INSERT INTO admin_users (company_id, username, display_name, password_hash, must_change_password, role)
VALUES ('00000000-0000-0000-0000-000000000001','admin','Administrador',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', true, 'admin')
ON CONFLICT (company_id, username) DO UPDATE SET
  password_hash        = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  must_change_password = true,
  is_active            = true,
  role                 = 'admin',
  updated_at           = NOW();

-- Vendedor / Consultora (tudo exceto Configurações)
INSERT INTO admin_users (company_id, username, display_name, password_hash, must_change_password, role)
VALUES ('00000000-0000-0000-0000-000000000001','vendedor','Vendedor(a)',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', true, 'operator')
ON CONFLICT (company_id, username) DO UPDATE SET
  password_hash        = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  must_change_password = true,
  is_active            = true,
  role                 = 'operator',
  updated_at           = NOW();

-- ============================================================
-- 4. Verificação final
-- ============================================================
SELECT username, display_name, role, is_active, must_change_password
FROM admin_users
WHERE company_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at;
