---
description: "Orchestrator: Fluxo de Execução de Features e Tarefas"
argument-hint: "<descrição da feature ou caminho da spec>"
---

# Orchestrator: Fluxo de Execução de Features e Tarefas

Tarefa: $ARGUMENTS

## Objetivo
Coordenar a entrega com qualidade técnica, aderência arquitetural e testes, minimizando handoffs e rework.

## Padrões obrigatórios (valem para todos os agentes)
1. **Value Objects:** conceitos com validação viram VOs imutáveis com `create()` e `equals()`.
2. **ID compartilhado:** toda entidade usa `EntityId` (UUID v4, `EntityId.create()`) em `apps/api/src/modules/shared/domain/value-objects/entity-id.value-object.ts`.
3. **Use Cases isolados:** um arquivo por caso de uso, exportando `XxxInput`, `XxxOutput` e a classe com único método público `execute(input): Promise<Output>`. Output só com primitivos.
4. **Camadas:** `domain/` e `application/` livres de NestJS/Prisma; Prisma apenas em `infrastructure/`; HTTP apenas em `presentation/`.

## 1. Seleção do caminho
- **Completo** (feature nova, regra de domínio, schema, segurança):
  `planner` → `architect` → `ui-designer` (se houver tela nova) → `backend-dev`/`frontend-dev` → `tester` → `reviewer`.
- **Enxuto** (bug, ajuste local, refatoração pequena):
  spec delta curta → dev → `tester` → `reviewer` (rodada única).
- Se o modelo configurado (`opus`/`sonnet`) estiver indisponível, use o disponível e registre no run.

## 2. Etapas
1. **Spec** — `planner` grava `docs/specs/<feature>.md` com VOs, Use Cases (Input/Output) e critérios de aceite.
2. **Arquitetura** — `architect` valida contratos, schema e fronteiras; ADR em `docs/adr/` só para decisões duradouras.
3. **Design** — `ui-designer` apenas para telas/fluxos novos.
4. **Implementação** — dev implementa orientado por testes, seguindo os padrões acima.
5. **Verificação** — `tester` roda `npm run test`, `npm run typecheck`, `npm run lint`, `npm run test:cov` e separa baseline × regressão.
6. **Revisão** — `reviewer` aplica a checklist; nova rodada só para 🔴 bloqueadores.

## 3. Handoff entre etapas
Resumo (≤ 3 parágrafos) · arquivos criados/alterados · comandos e status (PASS/FAIL) · bloqueadores. Detalhes via `git diff`.

## 4. Fechamento
- Registrar em `docs/runs/<feature>.md`: agentes acionados, divergências aceitas, follow-ups e estado final dos testes.
- Commit final apenas com testes passando.