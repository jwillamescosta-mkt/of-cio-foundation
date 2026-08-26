# Ofício Foundation

Quero construir um SaaS chamado Ofício para profissionais autônomos e

liberais gerenciarem recibos, contratos, precificação e despesas.

Nesta primeira etapa, quero APENAS a fundação do projeto — não implemente

os módulos de negócio ainda. Faça:

1. Estrutura de autenticação (login, cadastro, recuperação de senha) via

   Supabase Auth.

2. Layout base do app: sidebar de navegação fixa à esquerda com ícones +

   labels (Dashboard, Recibos, Contratos, Calculadora, Despesas,

   Configurações), header superior com nome do usuário e avatar.

3. Aplique o sistema de design descrito no Knowledge File (dark mode

   como padrão, paleta âmbar/quase-preto, Inter + mono para números,

   densidade alta ao estilo Linear).

4. Tela de Dashboard vazia por enquanto, só com o layout e placeholders

   de cards (não implemente lógica ainda).

5. Tela de Configurações com o formulário de Perfil Profissional completo

   e funcional: nome/razão social, CPF/CNPJ, endereço, upload de logo,

   dados bancários/PIX, campo de assinatura (pode ser upload de imagem

   por enquanto). Salvar no Supabase.

Não implemente ainda: recibos, contratos, calculadora ou despesas.

Antes de codar, me explique seu plano de estrutura de banco de dados

(tabelas e relações) para eu validar.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aec4a2c6-3043-48f7-af6f-ad5b04e72198).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
