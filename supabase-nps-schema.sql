-- ============================================================
-- NPS RESPONSES TABLE
-- Execute este bloco no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS nps_responses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL,
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  score               INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  team_rating         INTEGER,
  environment_rating  INTEGER,
  would_recommend     BOOLEAN,
  comment             TEXT,
  audio_data          TEXT,    -- base64 encoded audio (webm)
  points_awarded      INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index para verificação de cooldown
CREATE INDEX IF NOT EXISTS idx_nps_client_date
  ON nps_responses (client_id, created_at DESC);

-- Row Level Security
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nps_company_isolation" ON nps_responses
  FOR ALL USING (company_id = '00000000-0000-0000-0000-000000000001');

-- ============================================================
-- REGRA DE PONTOS PARA NPS (adicionar em point_rules)
-- Ajuste os pontos conforme necessário
-- ============================================================
INSERT INTO point_rules (company_id, name, points, rule_type, description, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pesquisa de Satisfação (NPS)',
  30,
  'nps_response',
  'Pontos concedidos ao cliente que responde a pesquisa NPS',
  true
) ON CONFLICT DO NOTHING;
