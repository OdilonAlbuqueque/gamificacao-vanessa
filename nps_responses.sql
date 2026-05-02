-- ============================================================
-- nps_responses — Respostas das Pesquisas NPS
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS nps_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  answers        JSONB NOT NULL DEFAULT '{}',  -- todas as respostas keyed por ID da pergunta
  nps_score      INTEGER,                       -- nota NPS (0-10) extraída para consultas rápidas
  comment        TEXT,                          -- comentário final (opcional)
  audio_data     TEXT,                          -- gravação de voz em base64
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de cooldown e relatórios
CREATE INDEX IF NOT EXISTS idx_nps_responses_client  ON nps_responses (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_responses_company ON nps_responses (company_id, created_at DESC);

-- RLS — leitura/escrita pelo anon key (portal do cliente)
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "nps_responses_open" ON nps_responses;
CREATE POLICY "nps_responses_open" ON nps_responses FOR ALL USING (true) WITH CHECK (true);
