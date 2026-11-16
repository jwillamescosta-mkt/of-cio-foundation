-- =========================================================================
-- Empresas e membros
--
-- Cria a empresa do prestador (organizations) e quem faz parte dela (members).
-- Toda tabela de negócio daqui em diante terá org_id e RLS por membro.
--
-- Esta migração SÓ ADICIONA: não apaga nem altera colunas de profiles.
-- Os dados da empresa são copiados de profiles para organizations; o app
-- passa a ler da empresa num PR seguinte, e só depois as colunas antigas
-- de profiles serão removidas.
--
-- Pode rodar mais de uma vez sem erro (if not exists / on conflict).
-- =========================================================================

-- Papel dentro da empresa
do $$
begin
  if not exists (select 1 from pg_type where typname = 'org_role' and typnamespace = 'public'::regnamespace) then
    create type public.org_role as enum ('owner', 'admin', 'member');
  end if;
end $$;

-- -------------------------------------------------------------------------
-- organizations: a empresa. Mesmos nomes de coluna usados hoje em profiles.
-- -------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,

  legal_name text,
  document_type public.document_type,
  document_number text,

  phone text,

  address_zip text,
  address_street text,
  address_number text,
  address_complement text,
  address_district text,
  address_city text,
  address_state text,

  logo_url text,
  signature_url text,

  bank_name text,
  bank_agency text,
  bank_account text,
  bank_account_type public.bank_account_type,

  pix_key text,
  pix_key_type public.pix_key_type,

  timezone text not null default 'America/Sao_Paulo',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- members: quem faz parte de cada empresa e com qual papel
-- -------------------------------------------------------------------------
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index if not exists members_user_id_idx on public.members (user_id);

-- -------------------------------------------------------------------------
-- Funções de apoio às políticas. security definer evita recursão de RLS
-- (a política de members consultaria a própria members).
-- -------------------------------------------------------------------------
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where org_id = _org_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(_org_id uuid, _roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where org_id = _org_id and user_id = auth.uid() and role = any(_roles)
  );
$$;

-- Empresa atual do usuário. No MVP cada usuário tem uma empresa;
-- se tiver mais de uma, vale a mais antiga.
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.members
  where user_id = auth.uid()
  order by created_at
  limit 1;
$$;

revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.has_org_role(uuid, public.org_role[]) from public, anon;
revoke execute on function public.current_org_id() from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, public.org_role[]) to authenticated;
grant execute on function public.current_org_id() to authenticated;

-- -------------------------------------------------------------------------
-- Permissões e RLS
-- Empresa e vínculo de dono são criados só pelo gatilho de cadastro
-- (security definer); por isso não há política de insert para o app.
-- -------------------------------------------------------------------------
grant select, update on public.organizations to authenticated;
grant all on public.organizations to service_role;
grant select on public.members to authenticated;
grant all on public.members to service_role;

alter table public.organizations enable row level security;
alter table public.members enable row level security;

drop policy if exists "Membros veem a própria empresa" on public.organizations;
create policy "Membros veem a própria empresa"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

drop policy if exists "Dono e admin editam a empresa" on public.organizations;
create policy "Dono e admin editam a empresa"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, array['owner', 'admin']::public.org_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.org_role[]));

drop policy if exists "Membros veem a equipe da própria empresa" on public.members;
create policy "Membros veem a equipe da própria empresa"
  on public.members for select
  to authenticated
  using (public.is_org_member(org_id));

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

-- -------------------------------------------------------------------------
-- Cadastro: além do perfil, cria a empresa e o vínculo de dono.
-- Substitui a função criada na primeira migração; o gatilho continua o mesmo.
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nome text := coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1));
  nova_org uuid;
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, nome)
  on conflict (id) do nothing;

  insert into public.organizations (name)
  values (nome)
  returning id into nova_org;

  insert into public.members (org_id, user_id, role)
  values (nova_org, new.id, 'owner');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- -------------------------------------------------------------------------
-- Cópia: cada usuário que ainda não tem empresa ganha uma, com os dados
-- que hoje estão no perfil dele, e vira dono.
-- -------------------------------------------------------------------------
do $$
declare
  p record;
  nova_org uuid;
begin
  for p in
    select pr.*
    from public.profiles pr
    where not exists (select 1 from public.members m where m.user_id = pr.id)
  loop
    insert into public.organizations (
      name, legal_name, document_type, document_number,
      address_zip, address_street, address_number, address_complement,
      address_district, address_city, address_state,
      logo_url, signature_url,
      bank_name, bank_agency, bank_account, bank_account_type,
      pix_key, pix_key_type
    ) values (
      coalesce(nullif(p.legal_name, ''), nullif(p.display_name, ''), split_part(p.email, '@', 1), 'Minha empresa'),
      p.legal_name, p.document_type, p.document_number,
      p.address_zip, p.address_street, p.address_number, p.address_complement,
      p.address_district, p.address_city, p.address_state,
      p.logo_url, p.signature_url,
      p.bank_name, p.bank_agency, p.bank_account, p.bank_account_type,
      p.pix_key, p.pix_key_type
    )
    returning id into nova_org;

    insert into public.members (org_id, user_id, role)
    values (nova_org, p.id, 'owner')
    on conflict (org_id, user_id) do nothing;
  end loop;
end $$;
