# Spec — Unidades de medida, categorias e estoque como dono das quantidades

Fluxo: Completo (regra de domínio + migração + UI admin). Modelo: principal (sem fallback).

## 1. Objetivo

1. O ADMIN passa a cadastrar **unidades de medida** (ex.: "Quilograma" / "kg"). Cada `Stock` aponta para exatamente uma unidade.
2. O ADMIN passa a administrar **categorias**. O produto passa a ter **uma única** categoria, obrigatória (hoje é N:N).
3. O **estoque é dono das quantidades.** O formulário e a API de produto não recebem mais quantidades nem variante. Criar um produto cria o `Stock` com 0 disponível. As quantidades só mudam em `/admin/estoque`.
4. A sidebar de admin passa a usar grupos recolhíveis e acessíveis.

Fora de escopo: quantidades fracionárias (v1 continua com inteiros; follow-up), remover a tabela `Variant`, conversão entre unidades, guardar a unidade no `OrderItem`, esconder `stock.*Quantity` do JSON público (ver §10).

## 2. Decisões

| # | Decisão |
|---|---|
| D1 | **`Product.categoryId` é obrigatório** (`NOT NULL`, FK `ON DELETE RESTRICT`). A migração mantém a **primeira** categoria de cada produto: a de menor `Category.createdAt`, com empate resolvido por `slug`. Produto sem categoria vai para a categoria `Sem categoria` (`sem-categoria`, ativa), que só é criada (ou reaproveitada, se já existir) quando há algum produto nessa situação. As categorias secundárias são **descartadas** (`_CategoryToProduct` é removida). |
| D2 | **`Stock.unitId` é obrigatório** (FK `RESTRICT`). A migração cria a unidade padrão `Unidade` / `un` com o id fixo `00000000-0000-4000-8000-000000000101`, vincula todos os estoques a ela e cria um `Stock` (0/0, `un`) para todo produto que ainda não tem. Invariante: todo produto tem **exatamente um** `Stock` (`Stock.productId` já é `UNIQUE`), com `variantId = null`. A aplicação nunca gravou `Stock` com `variantId`; se existir alguma linha legada assim, a migração não a altera (e não cria outra, por causa do `UNIQUE`). |
| D3 | **A unidade é escolhida ao criar o produto** (`unitId` é obrigatório na API; a web já deixa `un` selecionada). Depois, ela **só muda em `/admin/estoque`**. O formulário de edição mostra a unidade apenas para leitura, com o link "Alterar em Estoque". Trocar a unidade não converte quantidades: é só um rótulo (a web pede confirmação se houver saldo). |
| D4 | **Exclusão bloqueada** quando a categoria tem produtos ou a unidade tem estoques (`DomainError`; o caminho é desativar). O FK `RESTRICT` é a segunda barreira. Itens inativos continuam válidos onde já estão vinculados, mas **não podem ser atribuídos** de novo (nem em produto novo, nem em troca). |
| D5 | **Variantes legadas:** a tabela, as linhas existentes, a entidade `Variant`, o campo `variants` nas respostas e o fluxo `variantId` de pedidos (`reserve`/`release`, `create-order`) **ficam como estão**. Deixam de ser criadas ou editadas pelo formulário e pela API de produto, e os seeds param de criá-las. |
| D6 | **Categoria inativa** não aparece em `GET /categories` e não pode ser escolhida. Os produtos dela **continuam na loja** (a loja monta os chips a partir dos produtos). Resolvido em Q1. |
| D7 | **Use cases novos e os reescritos** (`create-product`, `update-product`) seguem o padrão obrigatório: pasta `application/use-cases/`, sem NestJS, ligados por `useFactory` e com `Output` só de primitivos. Os demais use cases legados de `catalog` (`@Injectable`) não são migrados nesta tarefa. |

## 3. Impacto por camada

| Camada | `catalog` | `inventory` | `shared` |
|---|---|---|---|
| domain | `Product`: `categories[]` → `category: Category` (obrigatória) + `changeCategory()`, e sai o `addCategory`. `Category`: `ensureAssignable()`; nome passa a usar o VO `ShortName`. `CategoryRepository`: `delete`, `countProducts`, `countProductsByCategory`. `ProductRepository.update(product)` (saem `categoryIds`, `variantInput` e `stockInput`). | **Novo** `MeasurementUnit` + `MeasurementUnitRepository` + VO `UnitAbbreviation`. `Stock`: `unit: MeasurementUnit`, `Stock.open()`, `changeUnit()`. | **Novo** VO `ShortName`. `equals()` em `EntityId`, `Slug` e `RequiredText`. |
| application | `use-cases/`: `create-product`, `update-product` (reescritos), `list-admin-categories`, `create-category`, `update-category`, `delete-category`. Mapper puro `admin-product.output.ts`. Removidos: `application/create-product.use-case.ts` e `application/update-product.use-case.ts`. | `use-cases/`: `list-measurement-units`, `create-measurement-unit`, `update-measurement-unit`, `delete-measurement-unit`, `change-stock-unit`. | — |
| infrastructure | `PrismaProductRepository`: `save` cria `Product` + `Stock` (com `unitId`) numa única escrita aninhada (atômica); `update` grava só colunas de `Product` + `categoryId` e **nunca** toca em `Stock`/`Variant`; `include: { category: true, variants: true, stock: { include: { unit: true } } }`. `PrismaCategoryRepository`: novos métodos; `P2002` (slug) e `P2003` (FK na exclusão) viram `DomainError`. Seeds. | `PrismaMeasurementUnitRepository` (novo; `P2002`/`P2003` → `DomainError`; `findByAbbreviation` com `mode: "insensitive"`). `PrismaStockRepository`: lê `unitId` com `include: { unit: true }`; `save` grava `unitId` no `create`; novo `changeUnit(stockId, unitId)` que faz `update` **só** de `unitId`. | — |
| presentation | DTOs de produto (`categoryId`, `unitId`), `AdminCategoriesController` (novo), serializers com `category` e `stock.unit`. | `AdminMeasurementUnitsController` (novo), incluindo `PATCH admin/products/:id/stock/unit`. | — |

**Wiring/DI.** Novo token `MEASUREMENT_UNIT_REPOSITORY` em `inventory/inventory.tokens.ts`; o `InventoryModule` registra `PrismaMeasurementUnitRepository` nele, os 5 use cases de unidade e o `AdminMeasurementUnitsController`, e exporta `STOCK_REPOSITORY` e `MEASUREMENT_UNIT_REPOSITORY`. O `catalog` já importa o `InventoryModule`. Use cases do padrão novo são classes puras registradas com a própria classe como token:
```ts
{ provide: CreateProductUseCase, useFactory: (p: ProductRepository, c: CategoryRepository, u: MeasurementUnitRepository) => new CreateProductUseCase(p, c, u),
  inject: [PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, MEASUREMENT_UNIT_REPOSITORY] }
```
Controllers injetam pela classe (sem `@Inject`). Os arquivos `use-cases/*` não importam `@nestjs/*`, `@prisma/client` nem `*.tokens.ts`.

## 4. Schema e migração

`schema.prisma`:
```prisma
model MeasurementUnit {
  id           String   @id @default(uuid())
  name         String
  abbreviation String   @unique
  active       Boolean  @default(true)
  stocks       Stock[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
model Category { /* ... */ products Product[] }                       // passa a ser 1:N
model Product  { /* ... */ categoryId String
                 category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
                 @@index([categoryId]) }                                  // sai `categories Category[]`
model Stock    { /* ... */ unitId String
                 unit MeasurementUnit @relation(fields: [unitId], references: [id], onDelete: Restrict)
                 @@index([unitId]) }
```

Migração **já escrita e validada**: `prisma/migrations/20261116000000_units_single_category/migration.sql` (o `schema.prisma` também já está atualizado). Ordem do backfill (todos os passos toleram reexecução: `IF NOT EXISTS`, `ON CONFLICT`, `WHERE ... IS NULL`, FKs criadas em bloco `DO` condicional):
1. `CREATE TABLE "MeasurementUnit"` + `UNIQUE("abbreviation")`; `INSERT` da unidade padrão (`'00000000-0000-4000-8000-000000000101'`, `'Unidade'`, `'un'`) com `ON CONFLICT DO NOTHING`.
2. `ALTER TABLE "Stock" ADD "unitId" TEXT`; `UPDATE "Stock" SET "unitId" = <padrão>`; `INSERT INTO "Stock"` (`gen_random_uuid()::text`, 0, 0, `<padrão>`) para cada `Product` sem **nenhuma** linha de `Stock`; `SET NOT NULL`; FK `RESTRICT`/`CASCADE`; índice.
3. `ALTER TABLE "Product" ADD "categoryId" TEXT`; `UPDATE ... FROM (SELECT DISTINCT ON (cp."B") ... FROM "_CategoryToProduct" cp JOIN "Category" c ORDER BY cp."B", c."createdAt", c."slug")` (`"A"` = categoria, `"B"` = produto).
4. Se `EXISTS(produto com categoryId NULL)`: `INSERT "Category"` `sem-categoria` com `ON CONFLICT ("slug") DO NOTHING`, seguido de `UPDATE ... WHERE "categoryId" IS NULL`.
5. `SET NOT NULL`; FK `RESTRICT`/`CASCADE`; índice; `DROP TABLE IF EXISTS "_CategoryToProduct"`.

Validado em Postgres 16 descartável: banco vazio (todas as migrações) e banco com dados legados (produto com 2 categorias e empate de `createdAt`, produto sem categoria e sem estoque, estoque com reserva) → critério 1 atendido; reexecução manual do script sem erro; `prisma migrate diff` contra o schema só mostra o drift **pré-existente** de `DEFAULT gen_random_uuid()` nos ids (vem de `20260829000000_uuid_defaults`; a nova tabela segue o mesmo padrão). Não usar `prisma migrate dev` para gerar a próxima migração sem antes tratar esse drift (ele proporia `DROP DEFAULT`).

Antes do deploy, rodar e guardar em `docs/runs/` a lista de produtos com mais de uma categoria (`SELECT "B", count(*) FROM "_CategoryToProduct" GROUP BY 1 HAVING count(*) > 1`), porque essas associações serão perdidas.

Seeds (**já atualizados**): `seed-data.js`/`catalog.seed-data.ts` exportam `DEFAULT_UNIT_ID` e `seedUnits`; `categorySlugs[]` → `categorySlug` (a primeira); `stock.unitId` = padrão; sem `variants`. `seed.js` faz `upsert` da unidade e do `Stock` **por `productId`** (a migração pode ter criado o `Stock` com outro id). `reset-demo-data.js` apaga as unidades exceto a padrão, depois de `Product` (o `Stock` cai em cascata).

## 5. Value Objects

| VO | Arquivo | Regra |
|---|---|---|
| `ShortName` | `shared/domain/value-objects/short-name.value-object.ts` | `trim` + espaços internos colapsados; 1 a 60 caracteres. Senão, `"{campo} e obrigatorio."` ou `"{campo} deve ter no maximo 60 caracteres."`. `equals`: compara o valor normalizado. Usado no nome da categoria e da unidade. |
| `UnitAbbreviation` | `inventory/domain/value-objects/unit-abbreviation.value-object.ts` | `trim`; 1 a 8 caracteres; sem espaços; `/^[\p{L}\p{N}.,\/%°²³-]+$/u`; **preserva a caixa** (`L`, `kg`, `m²`). `equals`: compara sem diferenciar maiúsculas de minúsculas (é a mesma regra de unicidade). Erro: `"Sigla da unidade invalida."`. |
| `Slug`, `EntityId`, `RequiredText` | existentes | Ganham `equals(other)`. As regras não mudam. |

Entidades:
- `MeasurementUnit.create({ id?, name, abbreviation, active? })`, com `rename(name, abbreviation)`, `activate()`, `deactivate()` e `ensureAssignable()` (lança `"Unidade de medida inativa."`).
- `Category.ensureAssignable()` lança `"Categoria inativa."`.
- `Product.changeCategory(category)`: sem efeito se for o mesmo id; senão chama `category.ensureAssignable()`.
- `Stock.open({ id?, productId, unit })`: estoque novo com 0/0 que exige `unit.ensureAssignable()`. O `Stock.create` (reconstituição) aceita unidade inativa. `Stock.changeUnit(unit)` segue a mesma regra de `changeCategory`. `reserve`, `release` e `adjustAvailable` ficam como estão (inteiros).

## 6. Use Cases

Todos em `<módulo>/application/use-cases/`, exportando `XxxInput`, `XxxOutput` e a classe com um único `execute()`. Mensagens de erro em ASCII (`DomainError`). Tipos compartilhados (primitivos):
```ts
type CategoryOutput = { id: string; name: string; slug: string; active: boolean };
type UnitOutput = { id: string; name: string; abbreviation: string; active: boolean };
// catalog/application/admin-product.output.ts (+ toAdminProductOutput(product), função pura)
type AdminProductOutput = { id: string; name: string; slug: string; description: string; priceCents: number;
  images: string[]; active: boolean; category: CategoryOutput;
  variants: Array<{ id: string; name: string; value: string; sku: string | null; active: boolean }>;
  stock: { id: string; availableQuantity: number; reservedQuantity: number; unit: UnitOutput } | null };
type ChangeStockUnitOutput = { productId: string; stockId: string; unit: UnitOutput };
```

| Arquivo | Input | Output | `execute()` / erros |
|---|---|---|---|
| `catalog/.../create-product.use-case.ts` | `name, slug, description, priceCents, images: string[], categoryId, unitId` | `AdminProductOutput` | Slug duplicado → `"Ja existe um produto com este slug."`; categoria ou unidade inexistente → `"Categoria nao encontrada."` / `"Unidade de medida nao encontrada."`; inativa → `ensureAssignable`. Cria `Product` + `Stock.open` (0/0) e salva. Deps: `ProductRepository`, `CategoryRepository`, `MeasurementUnitRepository`. |
| `catalog/.../update-product.use-case.ts` | `productId, name, slug, description, priceCents, images, categoryId` | `AdminProductOutput` | Não encontrado, slug duplicado, `updateDetails`, `changeCategory` (só bloqueia uma categoria inativa **diferente** da atual). **Não** mexe em estoque nem em variante. |
| `catalog/.../list-admin-categories.use-case.ts` | `{}` | `Array<CategoryOutput & { productCount: number }>` | Todas as categorias, ordenadas por nome. |
| `catalog/.../create-category.use-case.ts` | `name, slug` | `CategoryOutput` | VOs; slug duplicado → `"Ja existe uma categoria com este slug."`. Já nasce ativa. |
| `catalog/.../update-category.use-case.ts` | `categoryId, name, slug, active: boolean` | `CategoryOutput` | Não encontrada; slug duplicado em outra categoria; `activate()`/`deactivate()`. |
| `catalog/.../delete-category.use-case.ts` | `categoryId` | `{ deleted: true }` | Não encontrada; se `countProducts > 0` → `"Categoria possui produtos e nao pode ser excluida. Desative-a."`. |
| `inventory/.../list-measurement-units.use-case.ts` | `{}` | `Array<UnitOutput & { stockCount: number }>` | Todas, ordenadas por nome. |
| `inventory/.../create-measurement-unit.use-case.ts` | `name, abbreviation` | `UnitOutput` | VOs; sigla duplicada sem diferenciar caixa (`findByAbbreviation`) → `"Ja existe uma unidade com esta sigla."`. |
| `inventory/.../update-measurement-unit.use-case.ts` | `unitId, name, abbreviation, active: boolean` | `UnitOutput` | Não encontrada; sigla duplicada em outra unidade; ativar/desativar. |
| `inventory/.../delete-measurement-unit.use-case.ts` | `unitId` | `{ deleted: true }` | Não encontrada; se `countStocks > 0` → `"Unidade de medida em uso e nao pode ser excluida. Desative-a."`. |
| `inventory/.../change-stock-unit.use-case.ts` | `productId, unitId` | `{ productId: string; stockId: string; unit: UnitOutput }` | `"Estoque nao encontrado."` / unidade não encontrada; `stock.changeUnit(unit)` (regra de domínio); persiste com `stockRepository.changeUnit(stock.id, unit.id)` — **não** com `save`. As quantidades não mudam. |

Portas novas:
- `MeasurementUnitRepository` (`inventory/domain/repositories/measurement-unit.repository.ts`): `findById(id): Promise<MeasurementUnit | null>`, `findByAbbreviation(abbr)` (sem diferenciar caixa), `findAll(): Promise<MeasurementUnit[]>`, `save(unit): Promise<void>` (upsert), `delete(id): Promise<void>`, `countStocks(id): Promise<number>`, `countStocksByUnit(): Promise<Record<string, number>>`.
- `CategoryRepository` ganha `delete(id): Promise<void>`, `countProducts(id): Promise<number>` e `countProductsByCategory(): Promise<Record<string, number>>`.
- `StockRepository` ganha `changeUnit(stockId: string, unitId: string): Promise<void>` (atualiza **só** `unitId`). Motivo: `save()` regrava `availableQuantity`/`reservedQuantity` a partir do objeto lido e causaria *lost update* se um pedido reservasse entre a leitura e a gravação.
- `ProductRepository.update(product)` grava só os campos do produto + `categoryId`.

Os legados `AdjustProductStockUseCase`, `GetAdminProduct`, `ListAdminProducts` e `UpdateProductStatus` continuam como estão. Os controllers serializam o resultado deles com `toAdminProductOutput`.

## 7. API (todas as rotas novas usam `@AdminOnly()` na classe do controller → 401 sem sessão e 403 para USER)

| Método e rota | Body | Resposta |
|---|---|---|
| `POST admin/products` | `name, slug, description, priceCents, images, categoryId (IsUUID 4), unitId (IsUUID 4)` | `AdminProductOutput` |
| `PATCH admin/products/:id` | `name, slug, description, priceCents, images, categoryId` | `AdminProductOutput` |
| `GET admin/products`, `GET admin/products/:id` | — | `category` no lugar de `categories`; `stock.unit`. `:id` devolve `{ product, categories: CategoryOutput[] }` (todas, com `active`) |
| `PATCH admin/products/:id/stock` | `{ delta }` (sem mudança) | `AdminProductOutput` |
| `PATCH admin/products/:id/stock/unit` | `{ unitId }` | `ChangeStockUnitOutput` |
| `GET / POST admin/categories`, `PATCH / DELETE admin/categories/:id` | `{ name, slug }` / `{ name, slug, active }` | conforme §6 |
| `GET / POST admin/measurement-units`, `PATCH / DELETE admin/measurement-units/:id` | `{ name, abbreviation }` / `{ name, abbreviation, active }` | conforme §6 |
| `GET products`, `GET products/:slug` (públicas) | — | `categories[]` → `category`; `stock.unit` (sem outras mudanças) |

DTOs de produto: saem `categoryIds`, `variant*`, `availableQuantity` e `reservedQuantity`. Como o `ValidationPipe` usa `whitelist: true`, campos antigos enviados são **descartados** sem gerar erro e não têm efeito. DTOs novos: `name` (`IsString`, `MaxLength(60)`), `slug`/`abbreviation` (`IsString`), `active` (`IsBoolean`), `unitId`/`categoryId` (`IsUUID("4")`); o `:id` das rotas novas usa `ParseUUIDPipe({ version: "4" })`.

**Mapeamento de erros (igual ao atual):** `DomainError` → 400 com a mensagem, inclusive "nao encontrado(a)" vindos de use case; o 404 continua só onde já existe (`GET admin/products/:id`, `PATCH .../stock`). Erros Prisma nunca chegam ao controller: os repositórios convertem `P2002`/`P2003` em `DomainError`.

**Serialização pública** (`GET products*`): `category: { id, name, slug }`; `stock.unit: { id, name, abbreviation }`.

## 8. Web (`apps/web`)

**Serviços e actions**
- `src/services/storefront-api.ts`: `ApiProduct.category` e `ApiStock.unit` (`ApiUnit`); `AdminProductInput = { name, slug, description, priceCents, images, categoryId, unitId? }`; novos tipos `AdminCategory` e `AdminUnit` (com contagens); métodos `getAdminCategories`, `create/update/deleteAdminCategory`, `getAdminUnits`, `create/update/deleteAdminUnit` e `changeAdminStockUnit`. `toFeaturedProduct` e `FeaturedProduct` (`lib/storefront-content.ts`) passam a usar `category`. Fachada `lib/storefront-api.ts`: exportar os novos métodos de leitura.
- `app/actions/storefront-actions.ts`: `saveAdminCategoryAction(id | null, input)`, `deleteAdminCategoryAction`, `saveAdminUnitAction`, `deleteAdminUnitAction` e `changeAdminStockUnitAction(productId, unitId)`. Cada uma revalida a sua página e também `/admin/produtos`, `/admin/estoque` e `/` quando o efeito aparece nelas.

**Rotas**: todas com `await requireAdmin()` na página (o layout é só barreira de UX).
- **Nova** `app/(app)/admin/categorias/page.tsx`: tabela com nome, slug, status e nº de produtos; criar (form inline); editar; ativar/desativar; excluir (confirmação e mensagem da API se houver bloqueio).
- **Nova** `app/(app)/admin/unidades/page.tsx`: mesmo formato (nome, sigla, status, nº de estoques).
- `admin/produtos/novo`: carrega `getAdminCategories` e `getAdminUnits` (filtra os ativos). Sem categoria ou sem unidade ativa → aviso com links para `/admin/categorias` e `/admin/unidades`.
- `admin/produtos/[id]`: categorias = ativas + a atual; unidade só para leitura.
- `admin/produtos/page.tsx`: um chip de categoria; estoque com a sigla (`formatStock` recebe a sigla).
- `admin/estoque/page.tsx`: sigla ao lado de Disponível/Reservado; `AdminStockUnitSelect` por linha. Os cards "Unidades disponíveis/reservadas" (somar kg com un não faz sentido) viram "Produtos com estoque" e "Produtos com reserva". O texto "Até 5 unidades" vira "Até 5". O estado "Sem cadastro" fica só como fallback defensivo.
- `components/admin-dashboard.tsx`: `"{n} un."` → sigla real.
- Loja (`app/(app)/page.tsx`, `produto/[slug]/page.tsx`): chips e filtro por `product.category`; nenhuma quantidade exibida (sem mudança).

**Componentes**
- `admin-product-form.tsx`: remove o bloco "Variante principal" e as quantidades; checkboxes → `<select name="categoryId" required>`; no modo `create`, `<select name="unitId" required>` com `un` pré-selecionada (pela sigla); no modo `edit`, mostra a unidade com o link `/admin/estoque`.
- Novos (client, folhas): `admin-category-form.tsx`, `admin-category-actions.tsx`, `admin-unit-form.tsx`, `admin-unit-actions.tsx` e `admin-stock-unit-select.tsx` (o `<select>` tem um `label` acessível; `confirm` quando `available + reserved > 0`; erro em `role="alert"`).
- `app-sidebar.tsx`: a seção "Administração" (só ADMIN) vira grupos:
  - **Catálogo** (Produtos, Categorias) · **Estoque** (Visão geral → `/admin/estoque`, Unidades) · **Vendas** (Pedidos) · **Usuários** (link direto, sem grupo).
  - Cada grupo tem um `<button type="button" aria-expanded aria-controls="nav-group-{id}">` com ícone e `ChevronIcon` girando (`motion-reduce` respeitado), e um `<ul id hidden={!open}>`. Enter/Espaço funcionam pelo botão nativo e a ordem de Tab é a natural.
  - Ao montar e a cada mudança de `pathname`, o grupo que contém a rota ativa **é aberto** (os outros mantêm o estado). Um grupo fechado que contém a rota ativa destaca o cabeçalho.
  - `isActive`: `/admin/estoque` não pode marcar `/admin/unidades` nem vice-versa (já garantido pelo `startsWith(href + "/")`).

## 9. Critérios de aceite

1. Depois da migração em um banco com dados: todo `Product` tem `categoryId` igual à categoria de menor `createdAt` que tinha; produtos sem categoria ficam em `sem-categoria`; todo produto tem exatamente um `Stock` de produto; todo `Stock.unitId` é a unidade `un`; `_CategoryToProduct` não existe mais; as quantidades não mudam.
2. `POST admin/products` sem `unitId` ou `categoryId` → 400. Com uma categoria ou unidade inativa → 400 `"Categoria inativa."` / `"Unidade de medida inativa."`. Um produto criado tem `stock.availableQuantity = 0`, `reservedQuantity = 0` e `stock.unit` igual à enviada, mesmo se o body tiver `availableQuantity: 50`.
3. `PATCH admin/products/:id` com `availableQuantity`, `reservedQuantity` ou `variant*` não altera o estoque nem as variantes. Manter uma categoria atual que ficou inativa é permitido; trocar para outra categoria inativa → 400.
4. `PATCH admin/products/:id/stock` (`delta`) continua funcionando e é o único jeito de mudar o disponível. `PATCH .../stock/unit` troca a unidade sem alterar as quantidades.
5. `DELETE admin/categories/:id` com produtos e `DELETE admin/measurement-units/:id` com estoques → 400 com a mensagem "Desative-a". Sem vínculos → 200 `{ deleted: true }`.
6. Slug de categoria duplicado e sigla de unidade duplicada (`KG` x `kg`) → 400.
7. Todas as rotas novas: 401 sem sessão, 403 para USER. `/admin/categorias` e `/admin/unidades` redirecionam USER para `/`.
8. Pedidos: `CreateOrderUseCase` reserva, cancelar/excluir libera e as reservas expiram, tudo como hoje (os testes atuais de `orders` passam sem mudança de contrato; `CreateOrderInput.items[].variantId` continua aceito).
9. Formulário de produto: sem campos de variante e de quantidade; um `select` de categoria; no create, um `select` de unidade com `un` pré-selecionada.
10. `/admin/estoque` mostra a sigla em cada linha e permite trocar a unidade (com confirmação se houver saldo). Os cards não somam unidades diferentes.
11. Sidebar ADMIN: grupos Catálogo, Estoque e Vendas + link Usuários. Cada cabeçalho é um `button` com `aria-expanded` correto, alternável por Enter/Espaço. Ao abrir `/admin/unidades` direto, o grupo Estoque já vem aberto e o item tem `aria-current="page"`. USER não vê nada de admin.
12. Nenhuma tela de cliente mostra quantidades nem siglas de estoque.
13. `use-cases/*.use-case.ts` novos e reescritos não importam `@nestjs/*` nem `@prisma/client`, e o `Output` deles é só de primitivos.
14. `npm run lint`, `npm run typecheck` e `npm run test` passam; `npm run build -w web` conclui.

## 10. Riscos e dependências

- **Perda de dados:** as categorias secundárias somem (D1). Mitigação: o relatório pré-migração em `docs/runs/`. A migração não tem rollback automático; para voltar, é preciso restaurar o backup.
- **Breaking change de contrato:** `categories[]` → `category` nas rotas públicas e admin. O único consumidor é `apps/web`, então web e API precisam ser publicadas juntas.
- **Variantes legadas:** se a web enviar um `variantId` em um pedido, `reserve` procura o `Stock` da variante, que não existe nos seeds. Esse comportamento já existe hoje e fica como está. A remoção de `Variant` é um follow-up.
- **JSON público expõe `availableQuantity`/`reservedQuantity`** (a UI esconde; o carrinho usa como teto). Follow-up: trocar por `inStock: boolean` e validar o teto no servidor.
- **`StockRepository` importa `Prisma.TransactionClient`** (vazamento legado no domínio). Não corrigir agora; `change-stock-unit` depende da porta (só tipo, transitivo), mas o arquivo do use case não importa `@prisma/client`. Follow-up: trocar por um `UnitOfWork`/tipo opaco.
- **Unicidade da sigla sem diferenciar caixa** só existe na aplicação (o `@unique` é case-sensitive). A corrida é rara e aceita no v1.
- **Unidade sem snapshot no pedido:** trocar a unidade depois de uma venda muda o rótulo histórico. É aceito no v1 (o `OrderItem` não mostra unidade).

## 11. Tarefas (ordem de execução; cada uma fecha com testes)

**Backend**
1. VOs `ShortName` e `UnitAbbreviation` + `equals` em `EntityId`, `Slug` e `RequiredText`. Specs unitários.
2. Domínio: `MeasurementUnit`, `Stock.open/changeUnit/unit`, `Category.ensureAssignable`, `Product.category/changeCategory`; ajustar `catalog.entities.spec.ts` e `stock.entity.spec.ts`.
3. ~~Schema + migração com backfill (§4) + seeds~~ — feito pelo Architect (validado). Resta: `test/repositories.integration.spec.ts` (montar `Category`/`MeasurementUnit` antes do produto).
4. Infra: `PrismaMeasurementUnitRepository`, `PrismaStockRepository` (unit), `PrismaProductRepository` (categoryId, Stock com unit, sem variant/stockInput), `PrismaCategoryRepository` (delete/contagens). Casos em `test/repositories.integration.spec.ts`: o `RESTRICT` bloqueia a exclusão; save/find com unidade.
5. Use cases de `inventory` (§6) + specs com repositório em memória.
6. Use cases de `catalog`: reescrever `create-product`/`update-product` em `use-cases/` e criar os de categoria + o mapper `toAdminProductOutput`; atualizar `catalog.use-cases.spec.ts`.
7. Presentation + wiring: DTOs, `AdminCategoriesController`, `AdminMeasurementUnitsController`, serializers (`category`, `stock.unit`), `useFactory` nos módulos, export do repositório de unidades. Rodar a suíte de `orders` (critério 8).

**Frontend**
8. Tipos, serviços, fachada e actions (§8).
9. `admin-product-form` + páginas de produto (novo/editar/lista) + loja (`category`).
10. `/admin/categorias` e `/admin/unidades` + componentes.
11. `/admin/estoque` (sigla, `AdminStockUnitSelect`, cards) + `admin-dashboard`.
12. Sidebar com grupos (critério 11), com verificação manual de teclado e leitor de tela.
13. QA final: lint, typecheck, test e build; registrar em `docs/runs/` a verificação manual da UI e o relatório pré-migração.

## 12. Perguntas em aberto

Todas resolvidas com os padrões:
- **Q1:** desativar uma categoria **não** esconde os produtos dela da loja (D6).
- **Q2:** `Sem categoria` nasce **ativa** (se já existir, é reaproveitada no estado em que está).
- **Q3:** a unidade é escolhida na criação do produto e depois só muda em `/admin/estoque`; o formulário de edição a mostra só para leitura, com link (D3).
