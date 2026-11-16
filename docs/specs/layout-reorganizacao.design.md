# Design — Reorganização do layout (web)

Complementa `layout-reorganizacao.md`. Decisões do usuário: checkout fundido em `/carrinho` (Opção A) e `/painel` único por papel com `GET /admin/orders/summary`.

## 0. Base visual e ícones

- **Biblioteca de ícones:** nenhuma instalada (`apps/web/package.json` só tem next, react, tailwind). Não adicionar dependência. Criar `components/icons.tsx` com SVG inline exportado como componentes: `CartIcon`, `CartPlusIcon`, `CheckIcon`, `UserIcon`, `MenuIcon`, `CloseIcon`, `StoreIcon`, `DashboardIcon`, `BoxIcon`, `ReceiptIcon`, `UsersIcon`, `LogoutIcon`, `ChevronIcon`. Padrão do `cart-nav-link.tsx`: `viewBox="0 0 24 24"`, `fill-none stroke-current`, `strokeWidth="1.8"`, `aria-hidden="true"`, tamanho por `className` (default `h-5 w-5`). `CartNavLink` passa a usar `CartIcon`.
- **Tokens (CSS vars em `globals.css`, já com tema escuro):** `--background`, `--foreground`, `--surface`, `--surface-strong`, `--border`, `--muted`, `--accent`, `--accent-strong`, `--accent-soft`, `--danger(-border/-soft)`, `--success(-border/-soft)`. Utilitários: `.surface`, `.surface-strong`, `.text-muted`, `.fade-in-up`. Não criar tokens novos. Evitar `bg-white` e `text-[#hex]` novos: o tema escuro só os remapeia via seletores `[class*="bg-white"]`/`[class*="text-[#"]`; preferir `bg-[color:var(--surface-strong)]` e `text-[color:var(--foreground)]`.
- **Classes recorrentes**
  - Botão primário: `rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-[#fffaf2] transition hover:bg-[#34261d] disabled:cursor-not-allowed disabled:opacity-70`
  - Botão-ícone circular: `inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70 text-[#33271d] transition hover:border-[color:rgba(124,79,36,0.34)] hover:bg-white`
  - Input: `w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]`
  - Erro: `rounded-2xl border border-[color:var(--danger-border)] bg-[color:var(--danger-soft)] p-4 text-sm text-[color:var(--danger)]` com `role="alert"`
  - Sucesso: mesmas classes com `--success-*` e `role="status"`
  - **Foco visível (novo padrão para todos os controles do shell):** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]`. Hoje os botões não têm foco visível.
- Regra geral: só título de página (`PageHeader`), sem eyebrow/descrição. Alvos de toque >= 40px (`h-10 w-10`); no card, 44px em mobile (`h-11 w-11 sm:h-10 sm:w-10`).

## 1. Shell

Grid: `lg:grid lg:grid-cols-[240px_1fr]`, `min-h-screen`; coluna direita em `flex flex-col` (topbar sticky, `main` com `flex-1`, footer). Conteúdo dentro de `main`: `mx-auto w-full max-w-6xl px-4 py-6 sm:px-6`. Substitui `.page-shell` no shell.

**Sidebar** (`app-sidebar.tsx`)
- Container: `surface lg:sticky lg:top-0 lg:h-screen w-60 border-r border-[color:var(--border)] p-4 flex flex-col gap-1`. Marca "Loja Virtual" no topo (`text-lg font-semibold`, link para `/`).
- Itens (ícone + rótulo): Loja `/` (StoreIcon), Painel `/painel` (DashboardIcon), Carrinho `/carrinho` (CartIcon, badge de contagem igual ao da topbar). Grupo "Administração" (só ADMIN, separador `border-t mt-4 pt-4` + rótulo `text-xs uppercase tracking-wide text-muted`): Produtos (BoxIcon), Pedidos (ReceiptIcon), Usuários (UsersIcon). "Meus pedidos" não entra.
- Item: `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--foreground)]` + foco visível.
- **Ativo:** `bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)] font-semibold` + `aria-current="page"`. Ativo por prefixo (`/admin/produtos/123` ativa Produtos); `/` só por igualdade exata (produto/[slug] também ativa Loja).
- `<nav aria-label="Navegação principal">`; grupo admin em `<ul>` com `aria-labelledby` do rótulo.
- **Mobile (< lg):** sidebar oculta; botão hambúrguer na topbar (`MenuIcon`, `lg:hidden`, `aria-label="Abrir menu"`, `aria-expanded`, `aria-controls="app-sidebar"`). Drawer: `fixed inset-y-0 left-0 z-40 w-72 -translate-x-full transition-transform` -> `translate-x-0` quando aberto; overlay `fixed inset-0 z-30 bg-black/40`. Botão de fechar (`CloseIcon`) dentro do drawer. Fecha com Esc, clique no overlay e navegação (efeito em `pathname`). Foco vai ao botão de fechar ao abrir e volta ao hambúrguer ao fechar; `body` sem scroll enquanto aberto. Respeitar `motion-reduce:transition-none`.
- Sem colapso de ícones no desktop (YAGNI).

**Topbar** (`sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)] backdrop-blur px-4`)
- Esquerda: hambúrguer (mobile) + marca "Loja Virtual" (somente mobile, pois no desktop já está na sidebar).
- Direita (`ml-auto flex items-center gap-2`): `CartNavLink` (badge existente, `99+`), `ThemeToggle`, `UserMenu`.

**UserMenu** (`user-menu.tsx`)
- Gatilho: botão-ícone circular com `UserIcon`, `aria-label="Menu do usuário"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`. Sem nome visível.
- Painel: `absolute right-0 mt-2 w-64 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2 shadow-[0_20px_60px_rgba(50,31,14,0.16)] z-30`, `role="menu"`.
- Cabeçalho (não focável): nome `text-sm font-semibold`, e-mail `text-xs text-muted truncate`, badge "Admin" `rounded-full bg-[color:var(--accent-soft)] px-2 py-0.5 text-xs text-[color:var(--accent-strong)]`.
- Itens `role="menuitem"`: Meus pedidos `/pedidos`, Minha conta `/conta`, Sair (botão; `LogoutIcon`; durante logout `disabled` + "Saindo..."). Mesmo estilo de item da sidebar.
- Teclado: Enter/Espaço abre e foca o primeiro item; setas cima/baixo navegam; Esc fecha e devolve foco ao gatilho; clique fora e Tab para fora fecham.

**Footer** (`app-footer.tsx`): `border-t border-[color:var(--border)] px-4 py-4 text-center text-xs text-muted` com o texto exato `desenvolvido por kangaroo-tech`. Em `<footer>`, sem links.

## 2. Card de produto (`product-card.tsx` + `AddToCartButton variant="icon"`)

- Card: `surface group flex flex-col overflow-hidden rounded-[28px] transition hover:border-[color:rgba(124,79,36,0.34)]`. Imagem em proporção fixa `aspect-[4/3]` (placeholder neutro `grid-dots` sem texto), badge de categoria/status no canto. Corpo: nome (`font-semibold`, link para `/produto/[slug]`, `line-clamp-2`), linha inferior com preço à esquerda e botão-ícone à direita. Estoque baixo (`<= 5`): `text-xs text-[color:var(--danger)]` "Restam N". Sem descrição longa.
- Link do nome com `after:absolute after:inset-0` não é recomendado: o botão fica fora desse alvo, então o card inteiro **não** é link. Imagem e nome são links separados.
- Botão: `inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1d1712] text-[#fffaf2] transition hover:bg-[#34261d] sm:h-10 sm:w-10` + foco visível.

| Estado | Visual | a11y |
|---|---|---|
| Normal | `CartPlusIcon` | `aria-label="Adicionar {nome} ao carrinho"` |
| Adicionando (`isPending`) | ícone com `animate-pulse`, `disabled` | `aria-busy="true"` |
| Adicionado (~1,5 s) | `CheckIcon`, fundo `bg-[color:var(--success)] text-white`, volta ao normal depois | `aria-label="{nome} adicionado ao carrinho"`; anúncio em região `<span class="sr-only" role="status" aria-live="polite">Adicionado ao carrinho</span>` dentro do card |
| Sem estoque (`availableQuantity <= 0` ou qtd no carrinho = estoque) | `disabled`, `opacity-50`, `cursor-not-allowed`, ícone `CartIcon` | `aria-label="{nome}: sem estoque"` e `disabled`; texto "Sem estoque" visível ao lado do preço (não só cor) |

`prefers-reduced-motion`: sem pulse/transições (`motion-reduce:animate-none`). A contagem do badge da topbar atualiza em tempo real (`aria-label` do `CartNavLink` já traz a contagem).

Grade em `/`: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`. Barra de busca + chips de categoria no topo, chips com `aria-current` no ativo e `rounded-full border px-3 py-1.5 text-sm`; ativo `bg-[color:var(--accent-soft)] border-[color:var(--accent)]`. Estados: **vazio** (filtro sem resultado): `surface rounded-[28px] p-8 text-center` com "Nenhum produto encontrado" e link "Limpar filtros"; **carregando**: `loading.tsx` com 6 esqueletos `animate-pulse` do tamanho do card; **erro** de API: bloco de erro padrão com botão "Tentar novamente" (`error.tsx`).

## 3. `/carrinho` unificada

Desktop `lg:grid lg:grid-cols-[1fr_360px] gap-6`; mobile em coluna única, resumo depois dos blocos (botão final fixo não é necessário).

Coluna principal, nesta ordem (cada bloco: `surface rounded-[28px] p-5` com `<h2>` curto; sem parágrafos explicativos):
1. **Itens:** linha com miniatura, nome, preço unitário, controle de quantidade (`-`/`+` botões-ícone com `aria-label`, valor em `aria-live="polite"`), remover (`aria-label="Remover {nome}"`), subtotal da linha. Limite de quantidade = estoque; `+` desabilitado no limite.
2. **Contato e entrega:** nome, e-mail, telefone, CPF, CEP, rua, número, complemento, bairro, cidade, UF, referência (campos atuais), + seletor de **região** como `radiogroup` de 3 opções (capital / interior / litoral), cada uma mostrando só o nome e o valor (R$ 15 / 23 / 29), sem descrição. Selecionada: `border-[color:var(--accent)] bg-[color:var(--accent-soft)]`. Sem região escolhida, o frete mostra "—" (sem valor falso).
3. **Pagamento:** `radiogroup` Pix / Cartão, só rótulo e ícone.

Aside (`lg:sticky lg:top-20 surface rounded-[28px] p-5`): subtotal, frete da região (ou "—"), total em destaque, botão primário full-width "Finalizar pedido". Total só fica definitivo com região escolhida; botão `disabled` até itens > 0, campos obrigatórios válidos e região escolhida (o motivo aparece como erro inline junto aos campos, não só desabilitando).

Estados:
- **Vazio:** só o bloco `surface` centralizado com `CartIcon` grande, "Seu carrinho está vazio" e botão primário "Ver produtos" para `/`. Blocos 2, 3 e o aside não são renderizados.
- **Carregando (hidratação do localStorage, `hydrated=false`):** esqueletos nas linhas de itens e no resumo; evita flash de "vazio".
- **Enviando:** botão `disabled`, texto "Finalizando...", `aria-busy` no form; campos `disabled`.
- **Erro de campo:** mensagem `text-xs text-[color:var(--danger)]` abaixo do campo com `aria-invalid` e `aria-describedby`; ao enviar, foco no primeiro inválido.
- **Erro de estoque** (API recusa): faixa de erro (`role="alert"`) no topo da coluna principal, citando o produto e a quantidade disponível; a linha afetada ganha borda `--danger-border` e a quantidade é ajustada ao máximo disponível com ação "Ajustar". Dados do formulário preservados (`loja-ritual-checkout`).
- **Erro de pagamento/gateway:** mesma faixa `role="alert"` acima do aside com mensagem curta e "Tentar novamente"; o carrinho não é limpo.
- **Sucesso:** limpa o carrinho, `router.replace("/pedido/[number]")`. A página do pedido mostra a faixa de sucesso (`role="status"`, tokens `--success-*`) "Pedido {número} criado". Sem tela intermediária.

## 4. `/painel`

`PageHeader title="Painel"`. Grade de `StatCard`: `surface rounded-[24px] p-5` com rótulo `text-xs uppercase tracking-wide text-muted`, valor `text-3xl font-semibold`, grade `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`. Valores monetários em BRL; `tabular-nums`. Cards clicáveis (ex.: Aguardando pagamento) são links com foco visível.

**USER:** Total de pedidos · Aguardando pagamento · Em andamento · Último pedido (número, badge de status, total, link `/pedido/[number]`). Atalhos como botões: "Ir para a loja" (primário), "Ver carrinho (N)" (secundário).
**ADMIN:** linha 1 de KPIs: Pedidos totais · Aguardando pagamento · Em andamento · Cancelados; linha 2: Receita (`REVENUE_STATUSES`) · Pedidos em 30 dias · Produtos ativos/inativos · Usuários ativos. Abaixo, duas colunas (`lg:grid-cols-2`): "Pedidos recentes" (5 itens: número, status, total, link) e "Estoque baixo" (lista com link de edição). Atalhos de administração: botões Produtos, Pedidos, Usuários (mesmos destinos da sidebar, repetidos só aqui como CTAs).

Estados (por bloco, não da página inteira): **carregando** via `loading.tsx`/Suspense com `StatCard` esqueleto (`animate-pulse`, mesmo tamanho); **vazio**: USER sem pedidos mostra "Você ainda não fez pedidos" + botão "Ir para a loja" no lugar de Último pedido, KPIs com `0`; listas admin vazias mostram "Nenhum pedido recente" / "Estoque em dia" em `text-muted`; **erro:** cada bloco falho vira a faixa de erro padrão com "Não foi possível carregar" e botão "Tentar novamente" (`error.tsx`/refresh), sem derrubar os blocos que carregaram. Usuários `100+` quando atingir o limite.

## 5. Login enxuto

Fora do shell. Tela centralizada (`min-h-screen grid place-items-center px-4`), card `surface rounded-[28px] w-full max-w-sm p-6`. Conteúdo: marca "Loja Virtual" (`text-xl font-semibold`), `<h1>` "Entrar", campos E-mail e Senha (rótulos visíveis, input padrão, placeholder só no e-mail ou nenhum), erro `role="alert"`, botão "Entrar" full-width ("Entrando..." e `disabled` ao enviar). Sem parágrafos, cards "Cliente/Admin" nem aviso de cookie. Erro de credenciais com `aria-describedby` no formulário; foco inicial no e-mail (`autoFocus`). Alternar visibilidade da senha fica fora de escopo. `ThemeToggle` fixo no canto superior direito é opcional.

## 6. Acessibilidade (checklist)

- Landmarks: `<header>` (topbar), `<nav aria-label="Navegação principal">`, `<main id="conteudo">`, `<footer>`; link "Pular para o conteúdo" (`sr-only focus:not-sr-only`) como primeiro foco.
- Todo botão-ícone tem `aria-label`; ícones decorativos `aria-hidden`.
- Foco visível padrão da seção 0 em links, botões, itens de menu e inputs.
- Contraste: `text-muted` sobre `--surface` nos dois temas deve manter >= 4,5:1 (conferir no tema escuro, `--muted` #c5b8cd ok); não usar cor como único indicador (estoque, ativo, erro têm texto/ícone).
- Menus e drawer: Esc, foco gerenciado e devolução de foco ao gatilho.
- `prefers-reduced-motion` desliga pulse, `fade-in-up` e transição do drawer.
