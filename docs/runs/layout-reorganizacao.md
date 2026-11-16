# Run: layout-reorganizacao

- Data: 2026-11-16 · Branch: `review/layout` · Fluxo: completo
- Spec: `docs/specs/layout-reorganizacao.md` · Design: `docs/specs/layout-reorganizacao.design.md`

## Agentes acionados
planner → architect ∥ ui-designer → frontend-dev ∥ backend-dev → tester → reviewer (rodada única). Sem fallback de modelo.

## Decisões do usuário
- Checkout fundido em `/carrinho` (Opção A); `/checkout` redireciona. API de pedidos inalterada.
- Dashboard única `/painel` por papel + novo `GET /admin/orders/summary` (use case em `orders/application/use-cases/`).

## Divergências aceitas
- Title das páginas internas segue o template `%s | Loja Virtual` (home = "Loja Virtual").
- Chaves de localStorage `loja-ritual-*` mantidas para não apagar carrinhos salvos.
- USER em `/admin/*` recebe 200 com redirect em streaming (`requireAdmin` no layout); sem vazamento, API retorna 403.
- Use cases legados com `@Injectable` fora do escopo.

## Correção extra (pós-review)
- `safeNextPath` (`apps/web/app/actions/storefront-actions.ts`): open redirect pré-existente via caractere de controle (`/login?next=/%09/evil.com` → `evil.com`). Agora rejeita caracteres de controle e valida a origem com `new URL`.
- `revalidatePath("/")` do update de produto só roda quando a action dá certo.

## Follow-ups 🟡
1. Mapa status→rótulo pt-BR (`lib/format`) para `admin-dashboard`, `user-dashboard`, `pedidos`, `pedido/[number]`.
2. Grupos de status duplicados em `components/user-dashboard.tsx` (já existem em `order.entity.ts`).
3. Tabela de frete duplicada em `components/cart-section.tsx` (autoridade: `create-order.use-case.ts`); expor via endpoint/constante.
4. `/painel` busca a lista completa de pedidos admin para mostrar 5; adicionar `limit` na API.
5. `order.repository.ts` (domínio) importa `Prisma.TransactionClient` — dívida pré-existente.
6. `requireSession` redireciona para `/login` sem `next`.
7. Carrinho: ajuste automático de quantidade em erro de estoque e foco no primeiro campo inválido.
8. Adicionar `server-only` em `src/services/api-client.ts` e `storefront-api.ts`.
9. Web sem testes automatizados; verificação de UI foi manual/smoke via curl.

## Estado final
- `npm run lint` PASS · `npm run typecheck` PASS · `npm run test` PASS (API 40/40; baseline 34 + 6 novos) · `npm run test:cov` PASS (90,19% linhas; use case novo 100%) · `npm run test:integration` PASS 3/3 · `npm run build` PASS.
- Smoke ponta a ponta (tester): summary 401/403/200, painéis por papel, redirects, footer, login e criação de pedido refletindo no summary — OK.
