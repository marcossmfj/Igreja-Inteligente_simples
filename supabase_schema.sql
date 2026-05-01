-- Habilitar a extensão para UUIDs se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Igrejas
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    admin_name TEXT,
    admin_phone TEXT,
    admin_email TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    plan_type TEXT CHECK (plan_type IN ('trial', 'mensal', 'anual', 'premium')) DEFAULT 'trial',
    subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'blocked', 'canceled')) DEFAULT 'trialing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Perfis (Vinculada ao Auth do Supabase)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    church_id UUID REFERENCES churches(id),
    role TEXT CHECK (role IN ('master', 'admin', 'user')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Cargos (Customizável por igreja)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Habilidades (Customizável por igreja)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Membros
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    baptism_date DATE,
    marital_status TEXT CHECK (marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)')),
    status TEXT CHECK (status IN ('Ativo', 'Inativo', 'Afastado')) DEFAULT 'Ativo',
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Habilidades dos Membros (Muitos-para-Muitos)
CREATE TABLE member_skills (
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, skill_id)
);

-- 7. Tabela de Visitantes
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    visit_date DATE DEFAULT CURRENT_DATE,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Escalas
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL, -- A função necessária
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- HABILITAR RLS (Row Level Security)
-- ==========================================

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS DE ACESSO
-- ==========================================

-- Nota: Assumimos que o church_id está no token JWT via hooks do Supabase 
-- ou consultando a tabela profiles. Para simplicidade inicial, 
-- usaremos uma subquery que verifica o church_id do usuário logado.

CREATE POLICY "Usuários podem ver sua própria igreja" ON churches
    FOR SELECT USING (id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Política para o Admin Master (Dono do Sistema)
CREATE POLICY "Master pode tudo" ON churches FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'master'
);
CREATE POLICY "Master pode gerenciar perfis" ON profiles FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'master'
);

CREATE POLICY "Gerenciamento de Cargos por Igreja" ON roles
    FOR ALL USING (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Gerenciamento de Skills por Igreja" ON skills
    FOR ALL USING (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Gerenciamento de Membros por Igreja" ON members
    FOR ALL USING (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Gerenciamento de Visitantes por Igreja" ON visitors
    FOR ALL USING (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Gerenciamento de Escalas por Igreja" ON schedules
    FOR ALL USING (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    WITH CHECK (church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Gerenciamento de Skills de Membros por Igreja" ON member_skills
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE church_id IN (SELECT church_id FROM profiles WHERE id = auth.uid()))
    );

-- Política para o Admin Master (Dono do Sistema)
-- Pode ser adicionada posteriormente para permitir acesso global.

-- Triggers para criar o perfil automaticamente quando um usuário se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
