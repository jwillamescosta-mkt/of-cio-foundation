# Sistema de design do Ofício

O Ofício usa a base visual da marca Willames Costa (cores, fonte, cantos retos, sem sombra) com ajustes que um app de trabalho na rua exige: cores de status, tema claro para sol forte, ícones de interface e alvos de toque grandes. O Ofício tem nome próprio; o símbolo de quatro pontos da marca não é usado no app.

Fonte da verdade no código: `src/styles.css`. Este documento explica as regras; se os dois divergirem, corrija os dois no mesmo PR.

## Cores

### Tema escuro (padrão)

| Papel | Token | Cor | Uso |
| --- | --- | --- | --- |
| Fundo | `--background` | carvão `#1F1D1B` | Fundo de todas as telas |
| Superfície | `--card`, `--secondary`, `--muted` | bloco `#2D2A27` | Blocos, campos, barra inferior |
| Texto | `--foreground` | linho `#EAE4D9` | Texto principal (13,3:1 sobre carvão) |
| Texto de apoio | `--muted-foreground` | pedra `#A69E92` | Legendas, dicas (6,3:1) |
| Ação principal | `--primary` | linho, texto carvão | Botão principal |
| Anel | `--ring` | aço `#9DB2C4` | Foco do teclado e item ativo da navegação. Nunca texto, fundo ou botão |

### Tema claro (sol forte)

Ativado pelo botão de sol no cabeçalho; fica salvo no aparelho.

| Papel | Cor |
| --- | --- |
| Fundo | linho `#EAE4D9` |
| Superfície | `#F4F0E8` (um tom acima do fundo, para o texto de apoio passar de 5:1) |
| Texto | carvão `#1F1D1B` |
| Texto de apoio | pedra-escura `#6B645A` |
| Ação principal | carvão, texto linho |
| Anel | aço-escuro `#4A6680` |

### Status (ajuste do app)

A marca não usa vermelho nem cores chamativas. No app, status de dinheiro e agenda precisa ser visto de relance, então há três cores funcionais, terrosas e foscas. Só aparecem em texto, ícone ou marcador pequeno de status, sempre com a palavra ao lado. Nunca em botão, fundo de tela ou título.

| Status | Token | Escuro | Claro | Contraste mínimo |
| --- | --- | --- | --- | --- |
| Pago, confirmado | `--success` | sálvia `#9FBF94` | `#365E32` | 5,9:1 |
| Vence hoje, pendente | `--warning` | palha `#D9B97A` | `#6B4E18` | 6,1:1 |
| Atrasado, erro | `--destructive` | barro `#E0907C` | `#8E3828` | 5,7:1 |

## Tipografia

- Só Instrument Sans, pesos 400 e 500, servida de `public/fonts/`. Ênfase por peso, nunca por cor ou itálico.
- Números (valores, horários, quantidades) com algarismos tabulares: classe `tabular-nums`. A classe `font-mono` foi mantida por compatibilidade e também usa Instrument Sans tabular; não use fonte monoespaçada.
- Sem rótulos em caixa-alta espaçada. Rótulo é texto normal em `text-muted-foreground`.

| Uso | Tamanho / peso |
| --- | --- |
| Título de tela | 24 px / 500 no celular, 28 px no desktop |
| Seção | 17 px / 500 |
| Corpo | 16 px / 400 (nunca menos de 16 px em campo de formulário, para o iPhone não dar zoom) |
| Apoio | 14 px / 400 |
| Valor em destaque | 28 a 32 px / 500, `tabular-nums` |

## Formas

- Cantos retos em tudo (`--radius: 0`). Redondo só o que é ponto: o anel da navegação, marcadores de status e avatar.
- Sem sombra, sem gradiente, sem vidro. Profundidade só pela troca de superfície (fundo para bloco).
- Bordas de 1 px em `--border`, só quando a superfície sozinha não separa.

## Toque e uso na rua

- Alvo de toque mínimo de 44 × 44 px no celular. Botões e campos têm 44 px de altura no celular e 36 px no desktop.
- Uma ação principal por tela. A secundária é texto sublinhado ou botão de contorno.
- Nada importante só por cor: status sempre com palavra.

## Navegação

- Celular: barra inferior fixa com Hoje, Agenda, microfone (centro), Clientes e Dinheiro. Configurações e Sair ficam no menu do avatar, no cabeçalho.
- O item ativo é marcado pelo anel: um pequeno círculo vazado em `--ring` acima do rótulo. No máximo um anel por tela.
- O microfone é o maior alvo da barra: quadrado, fundo `--primary`.
- Desktop: menu lateral com os mesmos destinos.

## Movimento

O movimento existe para explicar o que mudou, nunca para enfeitar. Tudo é feito em CSS e em hooks pequenos (`src/hooks/`), sem biblioteca de animação.

- Tempos e curva da marca: rápido 200 ms, padrão 400 ms, lento 700 ms, curva `cubic-bezier(.2, 0, 0, 1)` (tokens `--mov-*`).
- Só se anima `transform`, `opacity`, cor e `clip-path`. Nada que mude o tamanho dos blocos.
- Com "reduzir movimento" ligado no aparelho, tudo aparece no estado final.
- Sem JavaScript, nada fica escondido.

| Efeito | Classe ou componente | Onde |
| --- | --- | --- |
| Entrada ao abrir a tela, em sequência | `.entrar` com `--i` | Todas as telas; cada troca de rota |
| Título que sobe linha por linha | `.linha-titulo` | Abertura da página pública |
| Revelação na rolagem | `data-revelar` + `useRevelar()` | Página pública |
| Frase que acende palavra por palavra | `FraseRolagem` | Página pública |
| Um dia contado na rolagem, seção presa na tela | `DiaRolagem` | Página pública |
| Linha de progresso da leitura | `.progresso-rolagem` | Página pública |
| Exemplo do comando por voz | `DemoComando` | Página pública e folha do microfone |
| Bloco que responde ao ponteiro | `.bloco-vivo` | Blocos de recurso e de resumo |
| Botão principal que inverte as cores | `.botao-vivo` | Ação principal |
| Link que redesenha o traço | `.link-vivo` | Ação secundária |
| Toque que afunda de leve | `.toque` e botões | Barra inferior e botões |
| Anel que desliza até o item ativo | `.anel-nav` | Barra inferior |
| Troca de tema em círculo, a partir do toque | `trocarTema()` | Botão de tema |

O anel continua sendo a assinatura: ele pulsa quando o microfone ouve, anda pela linha do tempo e abre a troca de tema. Fora do foco do teclado, só um anel aparece por vez.

Efeitos de ponteiro ficam dentro de `@media (hover: hover)`, para não "grudar" no toque do celular.

## Ícones

lucide-react, traço 1,5, herdando a cor do texto. Sem ícones coloridos, 3D ou ilustrações.

## Proibido

Herdado da marca: fundo creme com serifa e acento terracota; fundo quase preto com acento neon; cards arredondados com sombra; gradiente decorativo; rótulos em caixa-alta espaçada; fonte mono em rótulos; textos unidos por "·"; "→" em botões; palavra do título em outra cor; numeração 01/02/03 sem sequência real; emojis; mockup de celular; 3D; glassmorphism.
