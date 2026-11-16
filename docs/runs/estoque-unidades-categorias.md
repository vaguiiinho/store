# Run — Estoque: unidades de medida, categoria única e estoque dono das quantidades

- Spec: `docs/specs/estoque-unidades-categorias.md` · Design: `docs/specs/estoque-unidades-categorias.design.md`
- ADR: `docs/adr/0001-categoria-unica-e-unidade-no-estoque.md`
- Branch: `feat/estoque-unidades-categorias` · Data: 2026-11-16
- Fluxo: completo (`/feature`)

## Agentes acionados

| Etapa | Agente | Resultado |
|---|---|---|
| Spec | planner | Spec com 14 critérios e 13 tarefas. 1ª execução interrompida por limite de uso e relançada. |
| Arquitetura | architect | Schema + migração `20261116000000_units_single_category` validada em Postgres temporário (base vazia e com dados antigos); seeds; ADR 0001. |
| Design | ui-designer | Sidebar com grupos colapsáveis, telas de categorias/unidades, ajustes em estoque e formulário. |
| Backend | backend-dev | Tarefas 1–7. |
| Frontend | frontend-dev | Tarefas 8–12 (em paralelo ao backend, contra o contrato da spec; contrato conferido depois). |
| QA | tester | Todos os checks e smoke test ponta a ponta (ADMIN/USER/anônimo) em Postgres temporário. Sem regressões. |
| Revisão | reviewer | Aprovado, sem 🔴. |

## Decisões e divergências aceitas

- Perguntas em aberto resolvidas com os padrões da spec: desativar categoria não esconde produtos; `Sem categoria` nasce ativa; unidade escolhida na criação e alterada só em `/admin/estoque`.
- v1 mantém quantidades inteiras (unidade é rótulo); fração fica como follow-up.
- Sidebar usa `invisible` em vez de `hidden` nos grupos fechados, para permitir animação (links continuam fora do Tab e da árvore de acessibilidade).
- Sugestão 🟡 do reviewer aplicada no PR: `PrismaStockRepository.adjustAvailable` passou a ser atômico (`updateMany` com `increment` e guarda `gte`), pois o read-then-save podia apagar reservas concorrentes do checkout (risco de overselling). Teste de integração concorrente adicionado.
- Sugestão 🟡 aplicada: `saveAdminProductAction` valida UUIDs de produto/categoria/unidade; `updateAdminProduct` usa `encodeURIComponent`.

## Estado final dos testes

| Comando | Status |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test` | PASS (API 61/61; antes 40) |
| `npm run test:cov` | PASS (92,7% linhas) |
| `npm run test:integration` (api, testcontainers) | PASS (5/5) |
| `npm run build:web` | PASS |

## Pré-deploy

- **Relatório de multi-categoria (não executado em produção):** rodar no banco de produção antes do deploy e anexar aqui o resultado da query no cabeçalho de `migration.sql`. O deploy também faz backup do banco antes de migrar.
- API e web precisam ser publicados juntos (contrato `categories[]` → `category`; `Stock.unitId` NOT NULL).

## Follow-ups (🟡/🟢)

1. Converter `P2003`/`P2025` em `DomainError` em `PrismaProductRepository.save/update` e `PrismaStockRepository.changeUnit` (corridas raras hoje viram 500).
2. Mensagem "excluída" de categoria/unidade some no `router.refresh()`; mover anúncio para live region da lista.
3. `AdminStockUnitSelect` não sincroniza o estado local se a prop mudar sem reload.
4. Seed reativa a unidade `un` se o admin a tiver desativado.
5. Unicidade de sigla é case-insensitive só na aplicação (corrida pode criar `KG` e `kg`).
6. API pública ainda expõe quantidades exatas (carrinho usa como teto); trocar por flag de disponibilidade + limite.
7. Quantidades fracionadas (kg, L).
8. Verificação manual de teclado/leitor de tela da sidebar e dos temas claro/escuro.
