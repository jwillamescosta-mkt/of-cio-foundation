-- =========================================
-- 2. Organizações e membros
-- =========================================
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'org_member_role'
  ) then
    create type public.org_member_role as enum ('owner', 'admin', 'member');
  end if;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Meu Ofício',
  document_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  -- Lovable Cloud só permite chave para auth.users em profiles e user_roles;
  -- profiles.id já apaga em cascata junto com o usuário.
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.org_member_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index organization_members_user_id_idx on public.organization_members (user_id);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row
  execute function public.set_updated_at();

-- Funções security definer: as políticas de organization_members consultam a própria
-- tabela, e sem isso a RLS entraria em recursão.
create or replace function public.get_user_org_ids(_user_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.organization_members where user_id = _user_id;
$$;

create or replace function public.is_org_manager(_user_id uuid, _org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where user_id = _user_id
      and org_id = _org_id
      and role in ('owner', 'admin')
  );
$$;

revoke execute on function public.get_user_org_ids(uuid) from public, anon;
grant execute on function public.get_user_org_ids(uuid) to authenticated;
revoke execute on function public.is_org_manager(uuid, uuid) from public, anon;
grant execute on function public.is_org_manager(uuid, uuid) to authenticated;

grant select, insert, update, delete on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_members to authenticated;
grant all on public.organizations to service_role;
grant all on public.organization_members to service_role;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- organizations: sem política de insert nem de delete. A organização nasce pelo
-- trigger de cadastro; criar ou apagar pela API fica negado até existir regra para isso.
create policy "Members can view own organization"
  on public.organizations for select
  to authenticated
  using (
    id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Members can update own organization"
  on public.organizations for update
  to authenticated
  using (
    id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Members can view members of own organization"
  on public.organization_members for select
  to authenticated
  using (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Managers can add members"
  on public.organization_members for insert
  to authenticated
  with check (
    public.is_org_manager(auth.uid(), org_id)
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Managers can update members"
  on public.organization_members for update
  to authenticated
  using (
    public.is_org_manager(auth.uid(), org_id)
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    public.is_org_manager(auth.uid(), org_id)
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Managers can remove members"
  on public.organization_members for delete
  to authenticated
  using (
    public.is_org_manager(auth.uid(), org_id)
    or public.has_role(auth.uid(), 'admin')
  );

-- Organização padrão para cada novo cadastro. Roda depois de on_auth_user_created
-- (triggers disparam em ordem alfabética), então o profile já existe.
create or replace function public.handle_new_user_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _org_id uuid;
begin
  insert into public.organizations default values returning id into _org_id;
  insert into public.organization_members (org_id, user_id, role)
  values (_org_id, new.id, 'owner');
  return new;
end;
$$;

create trigger on_auth_user_created_organization
  after insert on auth.users
  for each row
  execute function public.handle_new_user_organization();

-- =========================================
-- 3. Clientes
-- =========================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  document_type public.document_type,
  document_number text,
  address_zip text,
  address_street text,
  address_number text,
  address_complement text,
  address_district text,
  address_city text,
  address_state text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_org_id_idx on public.clients (org_id);

create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

-- =========================================
-- 4. RLS e permissões de clients
-- =========================================
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;

alter table public.clients enable row level security;

create policy "Org members can view clients"
  on public.clients for select
  to authenticated
  using (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Org members can insert clients"
  on public.clients for insert
  to authenticated
  with check (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Org members can update clients"
  on public.clients for update
  to authenticated
  using (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );

create policy "Org members can delete clients"
  on public.clients for delete
  to authenticated
  using (
    org_id in (select public.get_user_org_ids(auth.uid()))
    or public.has_role(auth.uid(), 'admin')
  );