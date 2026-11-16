-- =========================================
-- Dados da empresa em organizations
--
-- Só adiciona: as colunas de empresa em profiles continuam onde estão.
-- O app passa a ler e gravar estes dados em organizations; uma migração
-- futura remove as colunas antigas de profiles.
-- Pode rodar mais de uma vez sem erro.
-- =========================================

-- 1. Campos da empresa (mesmos nomes usados hoje em profiles)
alter table public.organizations
  add column if not exists legal_name text,
  add column if not exists document_type public.document_type,
  add column if not exists phone text,
  add column if not exists address_zip text,
  add column if not exists address_street text,
  add column if not exists address_number text,
  add column if not exists address_complement text,
  add column if not exists address_district text,
  add column if not exists address_city text,
  add column if not exists address_state text,
  add column if not exists logo_url text,
  add column if not exists signature_url text,
  add column if not exists bank_name text,
  add column if not exists bank_agency text,
  add column if not exists bank_account text,
  add column if not exists bank_account_type public.bank_account_type,
  add column if not exists pix_key text,
  add column if not exists pix_key_type public.pix_key_type,
  add column if not exists timezone text not null default 'America/Sao_Paulo';

-- 2. Cópia: a empresa de cada dono recebe os dados que estão no perfil dele.
--    Só preenche o que está vazio na empresa; nada já preenchido é sobrescrito.
update public.organizations o
set
  name = case
    when o.name = 'Meu Ofício'
      then coalesce(nullif(p.legal_name, ''), nullif(p.display_name, ''), o.name)
    else o.name
  end,
  legal_name = coalesce(o.legal_name, p.legal_name),
  document_type = coalesce(o.document_type, p.document_type),
  document_number = coalesce(o.document_number, p.document_number),
  address_zip = coalesce(o.address_zip, p.address_zip),
  address_street = coalesce(o.address_street, p.address_street),
  address_number = coalesce(o.address_number, p.address_number),
  address_complement = coalesce(o.address_complement, p.address_complement),
  address_district = coalesce(o.address_district, p.address_district),
  address_city = coalesce(o.address_city, p.address_city),
  address_state = coalesce(o.address_state, p.address_state),
  logo_url = coalesce(o.logo_url, p.logo_url),
  signature_url = coalesce(o.signature_url, p.signature_url),
  bank_name = coalesce(o.bank_name, p.bank_name),
  bank_agency = coalesce(o.bank_agency, p.bank_agency),
  bank_account = coalesce(o.bank_account, p.bank_account),
  bank_account_type = coalesce(o.bank_account_type, p.bank_account_type),
  pix_key = coalesce(o.pix_key, p.pix_key),
  pix_key_type = coalesce(o.pix_key_type, p.pix_key_type)
from public.organization_members m
join public.profiles p on p.id = m.user_id
where m.org_id = o.id
  and m.role = 'owner';

-- 3. Só dono e admin editam a empresa (antes, qualquer membro podia).
drop policy if exists "Members can update own organization" on public.organizations;
drop policy if exists "Managers can update own organization" on public.organizations;
create policy "Managers can update own organization"
  on public.organizations for update
  to authenticated
  using (
    public.is_org_manager(auth.uid(), id)
    or public.has_role(auth.uid(), 'admin')
  )
  with check (
    public.is_org_manager(auth.uid(), id)
    or public.has_role(auth.uid(), 'admin')
  );

-- 4. Empresa de cadastro novo nasce com o nome da pessoa, não "Meu Ofício".
--    Roda depois de on_auth_user_created (ordem alfabética), então o perfil já existe.
create or replace function public.handle_new_user_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _org_id uuid;
  _nome text;
begin
  select nullif(display_name, '') into _nome from public.profiles where id = new.id;
  insert into public.organizations (name)
  values (coalesce(_nome, 'Meu Ofício'))
  returning id into _org_id;
  insert into public.organization_members (org_id, user_id, role)
  values (_org_id, new.id, 'owner');
  return new;
end;
$$;

revoke execute on function public.handle_new_user_organization() from public, anon, authenticated;
