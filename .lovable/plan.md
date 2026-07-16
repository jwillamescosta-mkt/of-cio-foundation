
# Plano — Fundação do Ofício

Foco desta etapa: autenticação, shell do app (sidebar + header), design system âmbar/dark ao estilo Linear, Dashboard placeholder e Configurações → Perfil Profissional funcional persistindo no Lovable Cloud (Supabase). Sem módulos de negócio ainda.

---

## 1. Backend — Lovable Cloud

Ativar Lovable Cloud (Supabase gerenciado) para termos Auth, Postgres e Storage.

### Tabelas

**`profiles`** — 1:1 com `auth.users`, criada automaticamente via trigger no signup. Guarda o Perfil Profissional que alimentará recibos e contratos no futuro.

| coluna | tipo | notas |
|---|---|---|
| `id` | uuid PK | = `auth.users.id`, FK com `ON DELETE CASCADE` |
| `email` | text | copiado do auth no trigger |
| `display_name` | text | nome curto exibido no header |
| `avatar_url` | text | opcional |
| `legal_name` | text | nome / razão social |
| `document_type` | text | `'cpf'` \| `'cnpj'` |
| `document_number` | text | só dígitos |
| `address_street`, `address_number`, `address_complement`, `address_district`, `address_city`, `address_state`, `address_zip` | text | endereço decomposto (facilita render no PDF depois) |
| `logo_url` | text | referência ao Storage |
| `signature_url` | text | imagem de assinatura no Storage |
| `bank_name`, `bank_agency`, `bank_account`, `bank_account_type` | text | dados bancários |
| `pix_key`, `pix_key_type` | text | `'cpf'\|'cnpj'\|'email'\|'phone'\|'random'` |
| `created_at`, `updated_at` | timestamptz | default `now()`, trigger para `updated_at` |

**`user_roles`** — tabela separada de papéis (nunca guardar role em `profiles`), com enum `app_role` (`'admin'`, `'user'`) e função `has_role(uuid, app_role)` `SECURITY DEFINER`. Já entra agora para não termos que refatorar auth depois.

### Relações

```text
auth.users (1) ──< (1) profiles
auth.users (1) ──< (N) user_roles
```

### RLS + GRANTs

- `profiles`: `SELECT/INSERT/UPDATE` só onde `auth.uid() = id`. Sem `DELETE` (perfil vive com o usuário). GRANT para `authenticated` + `service_role`.
- `user_roles`: leitura via `has_role()`. GRANT `SELECT` para `authenticated`, `ALL` para `service_role`. Sem acesso a `anon`.
- Trigger `on_auth_user_created` → insere linha em `profiles` com `id` e `email`.

### Storage

Dois buckets **privados** (assinatura e logo não devem vazar publicamente; servimos via signed URLs):
- `logos/` — path `{user_id}/logo.<ext>`
- `signatures/` — path `{user_id}/signature.<ext>`

Policies em `storage.objects`: usuário só lê/escreve/deleta objetos cujo primeiro segmento do path é o próprio `auth.uid()`.

---

## 2. Autenticação

Rotas públicas em `src/routes/auth.tsx` (tabs Entrar / Criar conta) e `src/routes/reset-password.tsx`.

- Signup: `supabase.auth.signUp` com `emailRedirectTo: window.location.origin`.
- Login: email + senha.
- Recuperação: `resetPasswordForEmail` com `redirectTo: origin + '/reset-password'`; a página `/reset-password` detecta `type=recovery` no hash e chama `updateUser({ password })`.
- Sessão hidratada no `__root.tsx` via `onAuthStateChange` filtrado (SIGNED_IN / SIGNED_OUT / USER_UPDATED) + `router.invalidate()`.
- Rotas protegidas sob `src/routes/_authenticated/` — o layout gerenciado pela integração cuida do gate; substituímos o `index.tsx` placeholder do template por uma landing pública com CTA "Entrar" que redireciona autenticados para `/dashboard`.

Google/Apple OAuth **fora** desta fase (não pedido); ficará como próximo passo se quiser.

---

## 3. Design System (aplicado em `src/styles.css`)

Reescrever tokens para bater com o Knowledge File — dark como padrão, sem paleta shadcn default.

Tokens principais (oklch):
- `--background` ≈ `#0B0B0F` (quase-preto)
- `--card` / superfícies ≈ `#131317`
- `--border` = `rgba(255,255,255,0.08)`
- `--primary` = âmbar `#D98E3A` + `--primary-foreground` escuro
- `--success` = `#4ADE80`, `--destructive` = `#F87171` (sóbrios, não neon)
- `--muted-foreground` cinza médio para labels
- Radius: `--radius: 0.5rem` (cards/inputs 8px, botões 6px via variantes)

Tipografia carregada via `<link>` no `head()` do `__root.tsx` (regra Tailwind v4 — nunca `@import` remoto):
- **Inter** (400/500/600) — UI e texto
- **JetBrains Mono** (400/500) — utilitário `.font-mono-num` / classe `tabular-nums` para valores monetários, números de documento, tabelas

`@theme` mapeia `--font-sans: "Inter"` e `--font-mono: "JetBrains Mono"`. `<html>` recebe classe `dark` por padrão (toggle claro fica para depois, só deixamos a estrutura).

Densidade alta: paddings compactos em `Button`, `Input`, `Card` — variantes ajustadas. Ícones `lucide-react` thin. Sem gradientes, sem emojis, sem ilustrações.

Meta do `__root.tsx` atualizada: título `Ofício — Gestão para profissionais autônomos`, descrição correspondente, og/twitter batendo.

---

## 4. Shell do App (`_authenticated/route.tsx` — customizado)

```text
┌─────────────────────────────────────────────┐
│ Sidebar (fixa)    │ Header (avatar + nome)  │
│ ─ Dashboard       ├─────────────────────────┤
│ ─ Recibos         │                         │
│ ─ Contratos       │  <Outlet />             │
│ ─ Calculadora     │                         │
│ ─ Despesas        │                         │
│ ─ Configurações   │                         │
│ (rodapé: sair)    │                         │
└─────────────────────────────────────────────┘
```

- `AppSidebar` com shadcn `Sidebar` (`collapsible="icon"`), ícones lucide (`LayoutDashboard`, `Receipt`, `FileText`, `Calculator`, `Wallet`, `Settings`), destaque no ativo via `useRouterState`.
- Header: `SidebarTrigger` + título da rota + `Avatar` (foto ou iniciais do `display_name`) com menu (Perfil, Sair).
- Rotas dos módulos ainda não pedidos: **não criar arquivos**. Os itens da sidebar para Recibos/Contratos/Calculadora/Despesas ficam desabilitados com badge "em breve" — evita 404 e mantém a navegação visível como pedido.

Rotas criadas nesta fase:
- `_authenticated/dashboard.tsx`
- `_authenticated/settings.tsx`
- `auth.tsx`, `reset-password.tsx`
- Rewrite de `index.tsx` (landing pública mínima com CTA).

---

## 5. Dashboard (placeholder)

`src/routes/_authenticated/dashboard.tsx`: título "Dashboard", subtítulo, grid de 4 cards vazios com skeleton/dash ("Receita do mês", "Despesas do mês", "Recibos emitidos", "Contratos ativos") — apenas layout, valores `—` em mono. Sem lógica, sem query.

---

## 6. Configurações → Perfil Profissional (funcional)

`src/routes/_authenticated/settings.tsx` com seções em cards:

1. **Identidade** — display name, avatar (upload → `logos/` reutiliza? Não — avatar do usuário fica em `signatures/`? Melhor separar: usaremos apenas `logo_url` como logo da marca e `avatar_url` como foto do header, ambos no bucket `logos/` em subpastas `{uid}/avatar` e `{uid}/logo`).
2. **Dados fiscais** — tipo (radio CPF/CNPJ), número (máscara BR), razão social/nome.
3. **Endereço** — CEP, rua, número, complemento, bairro, cidade, UF.
4. **Bancário / PIX** — banco, agência, conta, tipo; tipo de chave PIX + chave.
5. **Assinatura** — upload de imagem PNG/JPG para `signatures/{uid}/signature.<ext>`.
6. **Logo** — upload para `logos/{uid}/logo.<ext>`.

Implementação:
- Formulário único com `react-hook-form` + `zod` (validação: CPF 11 dígitos, CNPJ 14, CEP 8, UF 2, campos obrigatórios mínimos = display_name + document_number).
- Server function `updateProfile` com `requireSupabaseAuth` faz o `upsert` em `profiles`.
- Uploads via cliente browser Supabase Storage (bucket privado) → salva o path; leitura via `createSignedUrl` sob demanda.
- Query: `useSuspenseQuery(['profile', userId])` carregando via server fn `getMyProfile`.
- Feedback: `sonner` toast em sucesso/erro. Valores monetários (não há nesta tela) usariam mono; aqui números de documento usam `font-mono`.

---

## Detalhes técnicos

- Stack: TanStack Start + Tailwind v4 + shadcn (já no template) + Supabase (Lovable Cloud).
- Server fns em `src/lib/profile.functions.ts` + helpers `src/lib/profile.server.ts` (schema Zod compartilhado em `.functions.ts`).
- Middleware bearer já vem da integração — apenas garantir que `functionMiddleware` inclui o attacher no `src/start.ts`.
- Fontes via `<link>` no `head()` do root; nada de `@import` remoto no CSS.
- Placeholder `src/routes/index.tsx` será substituído por landing pública mínima (não deixar o SVG de template no ar).
- Sem `og:image` nesta fase (deixamos o hosting servir screenshot); og/title/description são reais.

---

## Fora do escopo desta fase (para você confirmar)

- Recibos, Contratos, Calculadora, Despesas — nenhum código.
- Geração de PDF — só na fase seguinte.
- OAuth Google/Apple — pode adicionar depois; se quiser já nesta fase, me avise.
- Light mode — tokens ficam preparados, mas sem toggle na UI.

Se o schema acima estiver ok (especialmente: endereço decomposto em colunas, buckets privados com signed URL, `user_roles` já criada), aprovo e sigo para build.
