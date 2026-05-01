-- =========================================================================
-- SCRIPT DE ATUALIZAÇÃO DA TABELA MEMBERS
-- Instruções: Execute este script no SQL Editor do seu projeto Supabase.
-- Isso adicionará os campos necessários para a Gestão Completa de Membros.
-- =========================================================================

-- Adicionando novos campos
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS baptism_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'));
ALTER TABLE members ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Ativo', 'Inativo', 'Afastado')) DEFAULT 'Ativo';

-- Nota: Como o RLS já está ativo, os inserts/updates da UI continuarão
-- respeitando a vinculação com church_id.
