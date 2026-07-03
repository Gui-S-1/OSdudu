-- ============================================================
-- GESTOR DE OS — Banco de dados Supabase
-- Cole este arquivo inteiro no "SQL Editor" do Supabase e
-- clique em RUN. Ele cria as tabelas e os usuarios iniciais.
-- ============================================================

-- Tabela de usuarios do aplicativo
create table if not exists app_users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    username text unique not null,
    password_hash text not null,
    role text not null default 'worker' check (role in ('admin', 'worker')),
    created_at timestamptz not null default now()
);

-- Tabela de Ordens de Servico
create table if not exists service_orders (
    id uuid primary key default gen_random_uuid(),
    numero bigint generated always as identity,
    title text not null,
    description text,
    local text,
    priority text not null default 'media' check (priority in ('baixa', 'media', 'alta', 'urgente')),
    status text not null check (status in ('aguardando_aprovacao', 'aberta', 'em_analise', 'concluida', 'recusada')),
    assigned_to uuid references app_users(id) on delete set null,
    assigned_name text,
    created_by uuid,
    created_name text not null,
    done_at timestamptz,
    done_local text,
    done_note text,
    closed_at timestamptz,
    closed_by_name text,
    created_at timestamptz not null default now()
);

-- Seguranca de linha (acesso via chave anon do app)
alter table app_users enable row level security;
alter table service_orders enable row level security;

drop policy if exists "leitura app_users" on app_users;
drop policy if exists "insercao app_users" on app_users;
drop policy if exists "atualizacao app_users" on app_users;
create policy "leitura app_users" on app_users for select using (true);
create policy "insercao app_users" on app_users for insert with check (true);
create policy "atualizacao app_users" on app_users for update using (true);

drop policy if exists "leitura service_orders" on service_orders;
drop policy if exists "insercao service_orders" on service_orders;
drop policy if exists "atualizacao service_orders" on service_orders;
create policy "leitura service_orders" on service_orders for select using (true);
create policy "insercao service_orders" on service_orders for insert with check (true);
create policy "atualizacao service_orders" on service_orders for update using (true);

-- Ativa notificacoes em tempo real para as ordens de servico
alter table service_orders replica identity full;
do $$
begin
  alter publication supabase_realtime add table service_orders;
exception when duplicate_object then null;
end $$;

-- ============================================================
-- Usuarios iniciais (senha padrao = nome + 123)
--   eduardo / eduardo123  (chefe)
--   declie  / declie123
--   samuel  / samuel123
--   jubileu / jubileu123
-- ============================================================
insert into app_users (name, username, password_hash, role) values
  ('Eduardo', 'eduardo', '5cc3d2d23a43b3acc067dc57ebeb3432ffdaeff2bb9a7f4ff3647a1ae4f052fb', 'admin'),
  ('Declie',  'declie',  '792a7d56e604c3661a362c048ee1d6198262a5eae62e9b47c4f52b31de7497d6', 'worker'),
  ('Samuel',  'samuel',  '3d34630dd6bbb687560bb54b1392911f25e2a2a3547dda9386f863386bd6396f', 'worker'),
  ('Jubileu', 'jubileu', '3d12504b41addb12421dc6f2aae9950f8a9a549e08012ec3376dc93055ed2785', 'worker')
on conflict (username) do nothing;
