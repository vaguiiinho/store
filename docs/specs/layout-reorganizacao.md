# Spec — Reorganização do layout (web)

Fluxo: Completo (transversal na web + 1 endpoint novo na API: `GET /admin/orders/summary`). Modelo: principal (sem fallback).

## 1. Objetivo

Trocar a divisão "vitrine" vs "administração" por um **shell único autenticado**: sidebar + topbar + footer, com os itens de admin aparecendo só para `ADMIN`. Enxugar a UI: tirar os cards e textos explicativos, juntar Início e Catálogo, colocar um ícone de carrinho nos cards, usar um ícone de usuário com menu suspenso, criar uma dashboard e corrigir o título "Loja Ritual" para "Loja Virtual".

Fora de escopo: mudar regras de pedido/estoque/pagamento, trocar o design system ou adicionar biblioteca de ícones (usar SVG inline, como em `cart-nav-link.tsx`).

## 2. Decisões e recomendações

### Decisão 1 — Checkout x carrinho (item 6) — RESOLVIDA: Opção A

**Situação atual**
- `/carrinho` (`components/cart-section.tsx`): estado só no cliente (localStorage `loja-ritual-cart`). Mostra itens, quantidade, remoção e totais. Não fala com a API. Mostra um **frete fixo falso de R$ 23,00** (linha 9), que não bate com o frete escolhido no checkout.
- `/checkout` (`components/checkout-section.tsx`): formulário de contato (nome, e-mail, telefone, CPF) e endereço (CEP, rua, número, complemento, bairro, cidade, UF, referência), seletor de região de frete (capital R$ 15 / interior R$ 23 / litoral R$ 29), seletor de pagamento (Pix/Cartão) e resumo. Ao enviar, chama `createOrderAction` → `POST /orders` → `CreateOrderUseCase`. Esse use case recalcula o frete pela tabela do servidor, valida os produtos, cria a cobrança no gateway (Mercado Pago/mock), **reserva o estoque com expiração** numa transação e redireciona para `/pedido/[number]`. Ainda tem textos de "Checkout visitante", embora o login seja obrigatório.
- `/carrinho/detalhes` é uma cópia de `/carrinho`.

**Conclusão:** o carrinho não faz nada no servidor. Toda a lógica de negócio está no envio do checkout. A separação em duas telas não protege nenhuma regra: só duplica o resumo e mostra um frete errado no meio do caminho.

**Decidido (Opção A): carrinho com finalização na mesma página.** `/carrinho` tem coluna principal = itens (editáveis) + bloco "Entrega" (contato, endereço e região) + bloco "Pagamento"; aside = resumo único com o frete **real** da região escolhida e o botão "Finalizar pedido". `/checkout` redireciona para `/carrinho`. Só web: `createOrderAction` → `POST /orders` → `CreateOrderUseCase` **não mudam** (contrato `CreateOrderInput` intacto). Página mais longa: seções recolhíveis no mobile.

- Tirar o frete fixo de `cart-section.tsx`, os textos "Checkout visitante / 1. Dados 2. Frete 3. Pagamento" e as descrições técnicas dos métodos de pagamento ("Fluxo pronto para… webhook").
- O frete exibido continua vindo da tabela client-side de `checkout-section.tsx` (capital 1500 / interior 2300 / litoral 2900), que espelha `shippingTable` de `create-order.use-case.ts`. O servidor recalcula e é a autoridade; o valor do pedido criado prevalece.
- Opção B (etapa separada) — descartada.

### Decisão 2 — Dashboard (item 10) — RESOLVIDA: `/painel` por papel + `GET /admin/orders/summary`

**Decidido:** **uma rota só, `/painel`, montada conforme o papel** (Server Component que lê `getSession()` e renderiza `UserDashboard` ou `AdminDashboard`). Motivo: o shell já é único; uma rota só evita duas entradas no menu e duas proteções de rota. Para `ADMIN`, mostrar também os blocos de usuário? Não. O admin vê só os indicadores da loja; os pedidos dele ficam em "Meus pedidos".

| Papel | Blocos | Fonte |
|---|---|---|
| USER | Total de pedidos; Aguardando pagamento (`AWAITING_PAYMENT`); Em andamento (`PAID`, `PREPARING`, `SHIPPED`); Último pedido (número, status, total, link); atalhos "Ir para a loja" e "Ver carrinho" (com a contagem de itens). | `GET /orders` (existente; até 50 pedidos, suficiente para o usuário). **Sem API nova.** |
| ADMIN | Pedidos totais; Aguardando pagamento (`CREATED` + `AWAITING_PAYMENT`); Em andamento; Entregues; Cancelados; Receita (status `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED`); Pedidos nos últimos 30 dias; 5 pedidos mais recentes (link para `/pedido/[number]`); Produtos ativos/inativos; Estoque baixo (`availableQuantity <= 5`, lista com link de edição); Usuários ativos. | Pedidos: **`GET /admin/orders/summary`** (seção 6). Produtos: `GET /admin/products` (sem limite). Usuários: `GET /admin/users` (até 100; mostrar "100+" quando atingir). Recentes: `GET /admin/orders` (primeiros 5). |

Por que o admin precisa de endpoint novo: `GET /admin/orders` usa `findAll(50)`. Contagens e receita calculadas a partir dessa lista ficam **erradas** com mais de 50 pedidos. E a "Receita" atual de `/admin/pedidos` soma todos os status, inclusive os `CANCELLED`.

- Alternativa sem API nova (indicadores rotulados "últimos 50 pedidos") — descartada.
- Os cards de KPI do topo de `/admin/pedidos` (Pedidos/Pendentes/Receita/Pagos) **saem dessa página** e passam para `/painel`. Os KPIs de `/admin/produtos` (Ativos/Inativos/Com estoque) também saem, pelo mesmo motivo.

### Demais decisões
- **Início + Catálogo (item 5):** `/` passa a ser a "Loja": busca `q`, filtro `categoria`, chips de categoria e a grade de produtos. `/catalogo` redireciona para `/` mantendo a query.
- **Layout único (item 1):** route group `app/(app)/` com `layout.tsx` (exige sessão e envolve `CartProvider` + `AppShell`). `/login` fica fora do grupo e não usa o shell. As URLs não mudam. `app/admin/layout.tsx` (`requireAdmin`) continua dentro do grupo, como segunda barreira. A API segue sendo a autoridade (`@AdminOnly`).
- **Marca (item 11):** trocar em `app/layout.tsx` (`default` e `template`) e no texto PIX do gateway mock (`apps/api/src/modules/payments/infrastructure/mock-payment.gateway.ts:60`: `5920LOJA RITUAL` → `5912LOJA VIRTUAL`, porque o campo 59 tem o tamanho como prefixo). **Manter** as chaves internas de localStorage `loja-ritual-cart` (`lib/cart.ts:11`) e `loja-ritual-checkout` (`checkout-section.tsx:77,96`): renomear apagaria os carrinhos já salvos e elas não aparecem para o usuário. "ritual diário" nas descrições de produto (seeds) é texto do produto, não a marca: fica. `scripts/create-store-features-video.mjs` está fora de escopo.

## 3. Rotas e navegação

| Rota | Estado | Acesso |
|---|---|---|
| `/` | Loja (catálogo unificado) | sessão |
| `/produto/[slug]` | mantém | sessão |
| `/carrinho` | carrinho + finalização do pedido | sessão |
| `/pedido/[number]` | mantém | dono ou ADMIN (API) |
| `/pedidos` | mantém (acesso só pelo menu do usuário) | sessão |
| `/conta` | mantém | sessão |
| `/painel` | **novo** — dashboard por papel | sessão |
| `/admin/produtos`, `/admin/produtos/novo`, `/admin/produtos/[id]`, `/admin/pedidos`, `/admin/usuarios`, `/admin/usuarios/[id]` | mantêm, dentro do shell | ADMIN |
| `/catalogo` | redirect → `/` (preserva a query) | — |
| `/carrinho/detalhes` | redirect → `/carrinho` | — |
| `/checkout` | redirect → `/carrinho` | — |
| `/admin` | redirect → `/painel` | — |
| `/admin/login` | redirect → `/login?next=/painel` | — |

Os redirects ficam em `next.config.js` (`redirects()`, `permanent: false`, para poder voltar atrás sem cache de 308). Remover as páginas correspondentes. Validado:
- `redirects()` roda **antes** do `proxy.ts`, então `/admin/login` → `/login?next=/painel` funciona sem cookie (e o proxy deixa `/login` passar).
- Next repassa a query string automaticamente: `{ source: "/catalogo", destination: "/" }` já preserva `?q=&categoria=`. Não usar `:path*` nesses casos.
- `source` é casamento exato: `/admin` não captura `/admin/produtos`. `/admin/login` precisa de entrada própria, e a página `app/admin/login/page.tsx` é removida (o redirect a substitui; mantê-la dentro de `(app)/admin/` a colocaria atrás de `requireSession`/`requireAdmin`).
- Os redirects que viram `next=` precisam passar por `safeNextPath` (já existe em `storefront-actions.ts`); `/painel` é caminho interno, ok.

**Sidebar** (`<nav aria-label="Navegação principal">`, item ativo com `aria-current="page"`):
- Todos: **Loja** (`/`), **Painel** (`/painel`), **Carrinho** (`/carrinho`, com badge da quantidade).
- Grupo "Administração" (só `role === "ADMIN"`): **Produtos**, **Pedidos**, **Usuários**.
- "Meus pedidos" **não** aparece na sidebar (item 8).
- Desktop (`lg+`): fixa à esquerda. Mobile: drawer aberto por um botão de menu na topbar, que fecha ao navegar, com Esc e no overlay.

**Topbar:** marca "Loja Virtual" (link `/`) · ícone do carrinho com contador (`CartNavLink`) · `ThemeToggle` · **ícone de usuário**.

**Menu do usuário** (botão com SVG de pessoa, `aria-label="Menu do usuário"`, `aria-haspopup="menu"`, `aria-expanded`; fecha com Esc e com clique fora): cabeçalho com nome, e-mail e badge "Admin" quando for o caso · **Meus pedidos** (`/pedidos`) · **Minha conta** (`/conta`) · **Sair**. Os links de admin saem daqui e vão para a sidebar.

**Footer** (todas as páginas do shell): texto exato `desenvolvido por kangaroo-tech`.

## 4. Remoção de cards e textos explicativos (item 3 e 9)

| Arquivo | Remover |
|---|---|
| `apps/web/app/page.tsx` | grade `storefrontStats` (l.19-26) e `storePillars` (l.28-35); título/descrição de herói; cabeçalho "Uma seleção curada…" (l.40-45) |
| `apps/web/lib/storefront-content.ts` | `storefrontStats`, `storePillars`, `routeLinks` e o mock `featuredProducts` (não usado); fica só o tipo `FeaturedProduct` |
| `apps/web/components/public-page.tsx` | arquivo inteiro (herói com eyebrow/descrição e os 3 cards "Fluxo/Estoque/Checkout" de l.105-118), substituído por `AppShell` + `PageHeader` |
| `apps/web/app/admin/page.tsx` | arquivo inteiro (cards "Pedidos/Operação" e "Produtos/Catálogo" de l.53-64 e o texto explicativo) |
| `apps/web/app/login/page.tsx` | parágrafo l.20-22, cards "Cliente/Admin" l.23-32, subtítulo "Use o e-mail e a senha…" l.37. Ficam: marca, título "Entrar" e formulário |
| `apps/web/components/login-form.tsx` | aviso "Sessão protegida por cookie httpOnly…" (l.65-67) |
| `apps/web/app/produto/[slug]/page.tsx` | seção "Próximos campos" (l.148-161); parágrafo de "Ação rápida" (l.110-112); placeholder "Espaço preparado para Cloudinary…" (l.51-61) → placeholder neutro sem texto |
| `apps/web/app/pedido/[number]/page.tsx` | "Linha do pedido" estática (l.62-80); descrição de herói; texto "Pedido registrado e pronto…" (l.38-40) |
| `apps/web/components/checkout-section.tsx` | "Checkout visitante", "1. Dados 2. Frete 3. Pagamento" e parágrafo (l.180-188); descrições técnicas dos métodos (l.54, l.60) e das regiões (l.33/39/45) |
| `apps/web/components/cart-section.tsx` | frete falso (l.9) e "prontos para o checkout" (l.46) |
| `apps/web/app/admin/{pedidos,produtos,usuarios,produtos/novo}/page.tsx` | descrição de herói, "Autenticado como …", botões "Voltar ao admin/painel" (a sidebar substitui) e KPIs (ver Decisão 2) |
| Herói das demais páginas (`carrinho`, `conta`, `pedidos`) | descrições de herói; fica só o `PageHeader` com o título |

## 5. Impacto por camada — web (`apps/web`)

**Criar**
- `app/(app)/layout.tsx` — `requireSession()`, `CartProvider`, `AppShell user={…}`.
- `components/app-shell.tsx` (server) — grid sidebar/topbar/main/footer.
- `components/app-sidebar.tsx` (client: `usePathname`, estado do drawer) — recebe `role`.
- `components/user-menu.tsx` (client) — substitui `auth-nav.tsx` (reaproveita o logout e a limpeza de `CART_STORAGE_KEY`).
- `components/app-footer.tsx` (server).
- `components/page-header.tsx` (server) — `title` e `actions?` opcionais.
- `components/product-card.tsx` (server) — card único usado em `/` (imagem, badge, preço, nome, estoque, link do detalhe e botão-ícone).
- `app/(app)/painel/page.tsx` + `components/user-dashboard.tsx` / `components/admin-dashboard.tsx` / `components/stat-card.tsx` (server).
- `getAdminOrderSummary(cookie)` em `src/services/storefront-api.ts` (`GET /admin/orders/summary`) + tipo `AdminOrderSummary` espelhando exatamente o Output da seção 6. Chamado **só** no ramo ADMIN de `/painel`, em Server Component.

**Alterar**
- Mover para `app/(app)/`: `page.tsx`, `produto/`, `carrinho/`, `pedido/`, `pedidos/`, `conta/`, `admin/` (as URLs não mudam). `app/layout.tsx`: título "Loja Virtual" e `description` sem "checkout".
- `app/(app)/page.tsx` — absorve a busca/filtro de `catalogo/page.tsx`, com `searchParams` **como Promise** (Next 16; hoje `catalogo/page.tsx` lê sincronamente). Links internos de filtro apontam para `/`.
- `components/add-to-cart-button.tsx` — nova prop `variant: "full" | "icon"`. O `icon` é um botão redondo com SVG de carrinho com "+", `aria-label="Adicionar {nome} ao carrinho"`, `disabled` + `aria-label` "Sem estoque" quando `availableQuantity <= 0` ou quando a quantidade no carrinho já é igual ao estoque, e feedback visual curto (ex.: um check por ~1,5 s). O `full` continua na página do produto.
- `components/cart-section.tsx` / `checkout-section.tsx` — Decisão 1: `CartSection` passa a renderizar o formulário de finalização abaixo dos itens, com resumo único. `app/(app)/carrinho/page.tsx` (server) obtém o e-mail via `requireSession()` e passa `loggedEmail` como prop (hoje isso é feito em `checkout/page.tsx`). Links `/catalogo` → `/`.
- `app/(app)/pedidos/page.tsx`, `pedido/[number]/page.tsx`, `produto/[slug]/page.tsx` — links `/catalogo`/`/checkout` → `/` / `/carrinho`; usar `PageHeader`.
- Páginas `admin/*` — trocar o `<main className="page-shell …">` próprio por conteúdo dentro do shell.
- `next.config.js` — `redirects()`.
- `app/actions/storefront-actions.ts` — `revalidatePath("/catalogo")` → `revalidatePath("/")`; `saveAdminProductAction` revalida `/admin/produtos` e `/`.

**Remover**: `app/catalogo/page.tsx`, `app/carrinho/detalhes/page.tsx`, `app/admin/page.tsx`, `app/checkout/page.tsx`, `app/admin/login/page.tsx`, `components/public-page.tsx`, `components/auth-nav.tsx`.

## 6. API — `GET /admin/orders/summary` (contrato final)

Módulo `orders`. Sem VO novo (`periodDays` é parâmetro de consulta, validado no use case). IDs não se aplicam. **Sem migração** de schema.

Status existentes (Prisma `enum OrderStatus` = enum de domínio em `order.entity.ts`): `CREATED`, `AWAITING_PAYMENT`, `PAID`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED`. `CREATED` é transitório no `CreateOrderUseCase`, mas o admin pode defini-lo via `changeStatus`, então precisa entrar em algum grupo.

**Domínio** — `orders/domain/entities/order.entity.ts` (junto do enum; sem arquivo novo):
```ts
export const PENDING_PAYMENT_ORDER_STATUSES: readonly OrderStatus[] = Object.freeze([OrderStatus.CREATED, OrderStatus.AWAITING_PAYMENT]);
export const IN_PROGRESS_ORDER_STATUSES: readonly OrderStatus[] = Object.freeze([OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.SHIPPED]);
export const REVENUE_ORDER_STATUSES: readonly OrderStatus[] = Object.freeze([OrderStatus.PAID, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]);
```
- A regra "o que conta como receita" vive **só** aqui. Receita = soma de `totalCents` (subtotal + frete) dos pedidos nesses status. `CANCELLED`, `CREATED` e `AWAITING_PAYMENT` ficam fora.
- Os 4 grupos (pendente, em andamento, `DELIVERED`, `CANCELLED`) particionam os 7 status: `awaitingPayment + inProgress + delivered + cancelled === totalOrders`.
- O repositório **não** recebe a lista de status: ele devolve números crus por status e o use case aplica a regra. Assim a regra não vaza para a infra e o teste unitário cobre tudo.

**Porta** — `orders/domain/repositories/order.repository.ts`:
```ts
export type OrderStatusTotals = { status: OrderStatus; count: number; totalCents: number };
export type OrderSummarySnapshot = { byStatus: OrderStatusTotals[]; createdSince: number };

export interface OrderRepository {
  // ...existentes
  /** Contagem e soma de totalCents por status (todos os pedidos) + quantidade de pedidos com createdAt >= since. Status sem pedidos podem estar ausentes. */
  summarize(since: Date): Promise<OrderSummarySnapshot>;
}
```
Os dublês atuais (`order.use-cases.spec.ts`, `payment.use-cases.spec.ts`) usam `as unknown as OrderRepository` e não quebram; o único implementador real é `PrismaOrderRepository`.

**Application** — `orders/application/use-cases/get-admin-order-summary.use-case.ts` (pasta nova; **sem** `@Injectable`/`@Inject` nem qualquer import do NestJS):
```ts
export type Clock = () => Date;

export type GetAdminOrderSummaryInput = { periodDays: number };

export type GetAdminOrderSummaryOutput = {
  totalOrders: number;      // todos os status
  awaitingPayment: number;  // CREATED + AWAITING_PAYMENT
  inProgress: number;       // PAID + PREPARING + SHIPPED
  delivered: number;        // DELIVERED
  cancelled: number;        // CANCELLED
  revenueCents: number;     // soma de totalCents em REVENUE_ORDER_STATUSES (inteiro, centavos)
  periodDays: number;       // eco do input
  periodStart: string;      // ISO 8601 (UTC) = now - periodDays * 24h
  ordersInPeriod: number;   // pedidos com createdAt >= periodStart (qualquer status)
};

export class GetAdminOrderSummaryUseCase {
  constructor(private readonly orderRepository: OrderRepository, private readonly clock: Clock) {}
  execute(input: GetAdminOrderSummaryInput): Promise<GetAdminOrderSummaryOutput>;
}
```
- Validação: `Number.isInteger(periodDays) && periodDays >= 1 && periodDays <= 365`; senão `throw new DomainError("Periodo invalido.")` (mensagens ASCII, como no resto da API).
- `now` vem do **relógio injetado** (`Clock`), não do Input nem do controller: o Input fica só com o que o cliente informa e o teste controla o tempo passando `() => new Date("2026-11-16T12:00:00Z")`. Janela móvel em UTC (`now.getTime() - periodDays * 86_400_000`), não "dias de calendário".
- Status ausentes no snapshot contam 0. Saída só com primitivos.

**Infra** — `PrismaOrderRepository.summarize(since)` (ORM, sem SQL raw), em paralelo (`Promise.all`):
- `prisma.order.groupBy({ by: ["status"], _count: { _all: true }, _sum: { totalCents: true } })` → `{ status, count: _count._all, totalCents: _sum.totalCents ?? 0 }`.
- `prisma.order.count({ where: { createdAt: { gte: since } } })` → `createdSince`.
- Leitura sem transação: as duas consultas podem ver instantes ligeiramente diferentes; aceitável para indicadores.

**Wiring** — `orders.module.ts`:
```ts
{
  provide: GetAdminOrderSummaryUseCase,
  useFactory: (orderRepository: OrderRepository) => new GetAdminOrderSummaryUseCase(orderRepository, () => new Date()),
  inject: [ORDER_REPOSITORY]
}
```
A classe serve de token; o controller a recebe por tipo no construtor (o controller tem metadata de DI, o use case não precisa).

**Presentation** — `OrdersController` (mesmo padrão das rotas admin atuais: decorator `@AdminOnly()` = `Roles(UserRole.ADMIN)`, lido pelo `AuthGuard` global → 401 sem sessão, 403 para USER):
```ts
@AdminOnly()
@Get("admin/orders/summary")
async getAdminOrderSummary() {
  try {
    return await this.getAdminOrderSummaryUseCase.execute({ periodDays: 30 });
  } catch (error) {
    this.rethrowDomainError(error);
  }
}
```
- Sem query string nesta versão (`periodDays` fixo em 30). Se um dia virar `?periodDays=`, o use case já valida.
- Resposta 200 = `GetAdminOrderSummaryOutput` sem transformação.
- Não há conflito de rota: as rotas `admin/orders/:id` atuais são `PATCH .../status` e `DELETE`. Se surgir um `GET admin/orders/:id`, declarar `summary` antes dele.

**Testes** — `orders/application/use-cases/get-admin-order-summary.use-case.spec.ts` com repositório em memória (sem lib de mock). Opcional: caso em `test/repositories.integration.spec.ts` para `summarize`.

## 7. Critérios de aceite

1. `/login` não mostra sidebar/footer nem os cards "Cliente/Admin", o parágrafo explicativo ou o aviso de cookie. Mostra só a marca, "Entrar", e-mail, senha e o botão.
2. Toda página autenticada (`/`, `/produto/*`, `/carrinho`, `/pedido/*`, `/pedidos`, `/conta`, `/painel`, `/admin/*`) mostra a sidebar, a topbar e o footer com o texto exato `desenvolvido por kangaroo-tech`.
3. Logado como USER, a sidebar tem exatamente Loja, Painel e Carrinho, sem o grupo "Administração". Como ADMIN, aparecem também Produtos, Pedidos e Usuários.
4. USER acessando `/admin/produtos` é redirecionado para `/` (web), e `GET /api/admin/*` responde 403 (API, sem mudança).
5. A topbar mostra um botão-ícone de usuário (sem o nome em texto). O menu contém Meus pedidos, Minha conta e Sair (e o badge Admin quando for admin). "Meus pedidos" não aparece em nenhum outro lugar da navegação. Esc fecha o menu.
6. `/` lista os produtos com busca e categoria. `/?q=moedor&categoria=cafe` filtra. `/catalogo?q=x` redireciona para `/?q=x`.
7. Cada card de produto em `/` tem um botão-ícone com `aria-label` "Adicionar {nome} ao carrinho". Clicar incrementa o contador do carrinho na topbar sem sair da página. Produto sem estoque mostra o botão desabilitado.
8. `rg -n "storefrontStats|storePillars|Próximos campos|Checkout visitante|cookie httpOnly|Linha do pedido" apps/web --glob '!.next'` não retorna nada.
9. `rg -n "Loja Ritual|LOJA RITUAL" apps --glob '!**/.next/**' --glob '!**/node_modules/**'` não retorna nada. A aba do navegador mostra "Loja Virtual" / "<Página> | Loja Virtual".
10. `/carrinho` cria o pedido e redireciona para `/pedido/[number]`. O frete do resumo é igual ao da região escolhida e ao `shippingCents` do pedido criado. `/checkout` redireciona para `/carrinho`. `POST /orders` e `CreateOrderInput` sem alteração.
11. `/carrinho/detalhes` → `/carrinho`; `/admin` → `/painel`; `/admin/login` → `/login?next=/painel`.
12. `/painel` como USER mostra os 4 blocos de usuário com base em `GET /orders`. Como ADMIN mostra os blocos de admin. `/admin/pedidos` e `/admin/produtos` não têm mais os cards de KPI.
13. (API) Testes unitários de `GetAdminOrderSummaryUseCase` com repositório em memória e relógio fixo: soma por grupos (`CREATED` conta em `awaitingPayment`), soma dos 4 grupos = `totalOrders`, status ausentes contam 0, receita só de `PAID/PREPARING/SHIPPED/DELIVERED` (`CANCELLED` e pendentes fora), `periodStart` = `now - periodDays*24h` em ISO e repassado ao `summarize`, `periodDays` 0/366/1.5/`NaN` → `DomainError`. `GET /admin/orders/summary` responde 401 sem sessão e 403 para USER. `get-admin-order-summary.use-case.ts` não importa `@nestjs/*`.
14. `npm run lint`, `npm run typecheck` e `npm run test` passam. `npm run build -w web` conclui com os redirects ativos.

## 8. Riscos e dependências

- **Links quebrados/salvos:** `/catalogo`, `/checkout`, `/carrinho/detalhes`, `/admin` e `/admin/login` são cobertos por redirects. Os links internos devem ser trocados (o critério 8 e um `rg "/catalogo|/checkout"` ajudam a verificar). E-mails/links antigos com `next=/admin` funcionam via redirect.
- **Route group:** mover os arquivos para `app/(app)/` gera um diff grande, mas só de caminho. Imports relativos (`../../components`) mudam de profundidade; o typecheck pega isso.
- **`CartProvider` no layout:** hoje cada `PublicPage` cria um provider próprio. Com um provider único no layout, o estado se mantém entre navegações, o que é desejado. As páginas admin passam a ter o carrinho disponível.
- **Carrinho + finalização (Decisão 1):** form maior numa página client. Manter `CartSection` como folha client e o `PageHeader` no server. Os dados salvos em `loja-ritual-checkout` continuam valendo.
- **`/admin/orders/summary`** faz `groupBy` em toda a tabela `Order` + `count` por `createdAt` (sem índice hoje; só `@@index([userId])`). Ok no volume do MVP; índice em `status`/`createdAt` só em volume alto, fora de escopo, sem migração.
- **Legado x regra nova:** os use cases antigos de `orders` usam `@Injectable` e ficam em `application/`; o novo vai em `application/use-cases/` sem decorators, ligado por `useFactory`. Não migrar os antigos nesta tarefa.
- **Autorização na web:** `app/(app)/admin/layout.tsx` (`requireAdmin`) é barreira de UX, não de segurança — layouts não re-executam em toda navegação client-side. A decisão USER/ADMIN de `/painel` deve ser feita **na página** (`await getSession()` no Server Component, cacheado por request), nunca por prop vinda do cliente; e quem garante o dado é a API (`@AdminOnly`). Se o ramo ADMIN receber 403 (papel rebaixado no meio da sessão), renderizar o painel de USER em vez de quebrar.
- **Server-only:** `src/services/storefront-api.ts`/`api-client.ts` usam `API_URL` e repassam o cookie; não há `import "server-only"` hoje. Componentes client (sidebar, user-menu, cart/checkout) só podem importar **tipos** (`import type`) e Server Actions de lá. Sugestão (amarelo): adicionar o pacote `server-only` e importá-lo nesses dois módulos para o build falhar se vazarem para o bundle client.
- **`proxy.ts`:** a checagem otimista por cookie continua cobrindo o route group (`/login` é a única rota pública); nada muda nele.
- **Mock PIX:** mudar o merchant name altera o texto do QR em ambiente mock; não afeta o Mercado Pago real.
- **Sem testes web:** a verificação da UI é manual/visual (critérios 1-12). Registrar em `docs/runs/` se não houver e2e.
