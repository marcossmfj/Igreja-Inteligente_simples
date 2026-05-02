-- Script para popular o banco de dados com dados de teste
-- Como rodar: Execute este script no SQL Editor do Supabase.

DO $$
DECLARE
    v_church_id UUID;
    v_role_ids UUID[];
    v_skill_ids UUID[];
    v_member_ids UUID[];
    v_member_id UUID;
    i INT;
    
    -- Arrays de dados aleatórios
    v_first_names TEXT[] := ARRAY['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Marcos', 'Fernanda', 'Rafael', 'Camila', 'Bruno', 'Aline', 'Thiago', 'Beatriz', 'Carlos', 'Amanda', 'Felipe', 'Letícia', 'Gabriel', 'Larissa', 'José', 'Isabela', 'Matheus', 'Laura', 'André', 'Manuela'];
    v_last_names TEXT[] := ARRAY['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Melo', 'Mendes', 'Nunes', 'Dias', 'Monteiro'];
    v_statuses TEXT[] := ARRAY['Ativo', 'Ativo', 'Ativo', 'Ativo', 'Inativo', 'Afastado']; -- Maior chance de Ativo
    v_marital TEXT[] := ARRAY['Solteiro(a)', 'Casado(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'];
BEGIN
    -- 1. Identificar a Igreja
    -- Pega a primeira igreja cadastrada no sistema (normalmente a sua se você já criou conta)
    SELECT id INTO v_church_id FROM churches LIMIT 1;
    
    IF v_church_id IS NULL THEN
        RAISE EXCEPTION 'Nenhuma igreja encontrada. Crie uma conta no sistema primeiro para gerar a igreja.';
    END IF;

    -- 2. Limpar dados antigos de teste dessa igreja (Opcional, mas previne duplicatas extremas)
    -- DELETE FROM members WHERE church_id = v_church_id;
    -- DELETE FROM visitors WHERE church_id = v_church_id;
    -- DELETE FROM roles WHERE church_id = v_church_id;
    -- DELETE FROM skills WHERE church_id = v_church_id;

    -- 3. Criar Cargos (Roles)
    INSERT INTO roles (name, church_id) VALUES 
        ('Pastor Auxiliar', v_church_id),
        ('Diácono/Diaconisa', v_church_id),
        ('Líder de Jovens', v_church_id),
        ('Membro', v_church_id),
        ('Músico', v_church_id);

    -- Guardar IDs dos cargos criados (ou existentes) em um array
    SELECT array_agg(id) INTO v_role_ids FROM roles WHERE church_id = v_church_id;

    -- 4. Criar Habilidades (Skills)
    INSERT INTO skills (name, church_id) VALUES 
        ('Canto', v_church_id),
        ('Violão', v_church_id),
        ('Bateria', v_church_id),
        ('Recepção', v_church_id),
        ('Mídia/Projeção', v_church_id),
        ('Limpeza', v_church_id),
        ('Teatro', v_church_id);

    -- Guardar IDs das habilidades em um array
    SELECT array_agg(id) INTO v_skill_ids FROM skills WHERE church_id = v_church_id;

    -- 5. Inserir 40 Membros
    FOR i IN 1..40 LOOP
        INSERT INTO members (
            name, 
            phone, 
            email, 
            birth_date, 
            baptism_date, 
            marital_status, 
            status, 
            role_id, 
            church_id
        ) VALUES (
            -- Nome Aleatório
            v_first_names[1 + mod(abs(random()::int), array_length(v_first_names, 1))] || ' ' || 
            v_last_names[1 + mod(abs(random()::int), array_length(v_last_names, 1))],
            
            -- Telefone Aleatório
            '(11) 9' || trunc(random() * 8999 + 1000)::text || '-' || trunc(random() * 8999 + 1000)::text,
            
            -- Email Aleatório
            'membro' || i || '@exemplo.com',
            
            -- Data de Nascimento Aleatória (Entre 15 e 60 anos atrás, garantindo que alguns caiam no mês atual)
            CURRENT_DATE - (interval '1 year' * (15 + trunc(random() * 45))) 
                         + (interval '1 month' * trunc(random() * 12)) 
                         + (interval '1 day' * trunc(random() * 28)),
            
            -- Data de Batismo Aleatória
            CURRENT_DATE - (interval '1 year' * trunc(random() * 10)),
            
            -- Estado Civil Aleatório
            v_marital[1 + mod(abs(random()::int), array_length(v_marital, 1))],
            
            -- Status Aleatório
            v_statuses[1 + mod(abs(random()::int), array_length(v_statuses, 1))],
            
            -- Role Aleatória
            v_role_ids[1 + mod(abs(random()::int), array_length(v_role_ids, 1))],
            
            v_church_id
        ) RETURNING id INTO v_member_id;

        -- 6. Adicionar 1 a 3 Skills aleatórias para este membro
        INSERT INTO member_skills (member_id, skill_id)
        SELECT v_member_id, id 
        FROM unnest(v_skill_ids) as id 
        ORDER BY random() 
        LIMIT (1 + trunc(random() * 3));

    END LOOP;

    -- 7. Inserir 10 Visitantes
    FOR i IN 1..10 LOOP
        INSERT INTO visitors (
            name, 
            phone, 
            visit_date, 
            church_id
        ) VALUES (
            'Visitante ' || v_first_names[1 + mod(abs(random()::int), array_length(v_first_names, 1))],
            '(11) 9' || trunc(random() * 8999 + 1000)::text || '-' || trunc(random() * 8999 + 1000)::text,
            CURRENT_DATE - (interval '1 day' * trunc(random() * 30)), -- Visitou nos últimos 30 dias
            v_church_id
        );
    END LOOP;

END $$;
