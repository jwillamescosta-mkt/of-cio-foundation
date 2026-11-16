# CLAUDE.md — Ofício

Leia também `AGENTS.md` (aviso do Lovable) e `docs/design.md` (sistema de design) antes de mexer na interface.

## Produto

Ofício é um app de bolso para prestadores de serviço autônomos ou com equipe pequena (1 a 5 pessoas). Nicho de entrada: técnicos de ar-condicionado e refrigeração.

O prestador fala ou digita uma frase e o sistema organiza: cliente, agenda, orçamento, atendimento, recibo e cobrança. Os dados de cada etapa alimentam a seguinte, sem redigitar.

Módulos do MVP: comando por voz e texto, mini CRM, agenda (visitas técnicas, orçamentos, execução, rotina recorrente), orçamento, atendimento simples, recibo, contas a receber com alertas, rota do dia aberta no Google Maps ou Waze. Contratos, insumos, rotas otimizadas, Pix no recibo e link do cliente vêm na V2.

## Stack

- TanStack Start (React 19) sobre Vite 8, TypeScript, Tailwind CSS v4, shadcn/ui, lucide-react.
- Rotas em `src/routes/` (file-based). `src/routeTree.gen.ts` é gerado: não edite à mão.
- Backend: Lovable Cloud (Supabase gerenciado): Postgres com RLS, Auth, Storage, Edge Functions.
- Cliente Supabase em `src/integrations/supabase/`. `types.ts` é gerado pelo Lovable.

## Fluxo de trabalho

- O projeto está ligado ao Lovable com sincronização na `main`. Trabalhe sempre numa branch `feat/*` e abra pull request. Nunca force push nem reescreva commits já publicados.
- O Lovable cuida da interface fina, do banco e da publicação. O Claude Code cuida da lógica, das integrações, da IA de voz, de testes e de refatoração.
- Migrações: crie um arquivo novo em `supabase/migrations/` por mudança; nunca edite uma migração antiga. No Lovable Cloud quem aplica a migração é o Lovable: depois do merge, peça a ele para aplicar e confira no painel Cloud. Código que depende de uma tabela nova só entra na `main` junto com a migração.
- O `bun.lock` aponta para o cache de pacotes privado do Lovable. Fora do Lovable, para testar o build, instale com npm numa cópia do projeto (`npm install --registry=https://registry.npmjs.org` e `npx vite build`) e não envie `package-lock.json` nem mudanças no `bun.lock`.

## Regras de dados

- Toda tabela de negócio tem `org_id` (a empresa do prestador) e política RLS que restringe aos membros da organização. Nenhuma consulta sem esse filtro.
- Empresa: `organizations` (dados da empresa) e `members` (quem faz parte, com papel `owner`, `admin` ou `member`). Todo cadastro novo cria uma empresa e o vínculo de dono. Nas políticas RLS use `is_org_member(org_id)` e `has_org_role(org_id, ...)`; no app, `current_org_id()` devolve a empresa do usuário.
- Transição: os dados da empresa ainda existem também em `profiles` (razão social, documento, endereço, logo, assinatura, banco, Pix). Leitura e escrita devem passar para `organizations`; só depois disso uma migração remove essas colunas de `profiles`.
- Teste migrações antes do PR num Postgres local (PGlite), imitando `auth.users`, `auth.uid()` e os papéis do Supabase.
- Valores monetários em centavos (`integer`). Datas com fuso horário (`timestamptz`). Recorrência por regra RRULE, não por centenas de linhas futuras.
- Documentos emitidos (recibo, contrato, orçamento aceito) são versionados: nunca sobrescrever depois de emitido.

## IA e voz

- Chamadas de IA, mapas, pagamentos e WhatsApp só em edge functions, com chaves nos Secrets. Nunca no código do navegador.
- Toda ação vinda de voz ou texto livre passa por um cartão de confirmação antes de gravar. Nada é salvo sem o usuário confirmar.
- O áudio é apagado depois da transcrição. Guarde a transcrição e o que foi criado em `voice_commands`.

## Textos da interface

- Português do Brasil, frases curtas, tom preciso e calmo.
- Sem exclamação, sem emoji, sem "transformar", "alavancar", "escalar", "destravar".
- Valores em R$ 1.234,56 (`formatBRL` em `src/lib/format.ts`); datas em dd/mm/aaaa (date-fns com o locale `ptBR`).
- Recibo sempre com a frase "Este documento não substitui a nota fiscal".

## Antes de abrir o PR

- Build passando.
- Telas conferidas em 390 px de largura (celular) e em desktop, nos temas escuro e claro.
- Diga no PR o que não foi verificado.
