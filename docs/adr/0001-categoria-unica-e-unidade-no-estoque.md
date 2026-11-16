# ADR 0001 — Categoria única por produto e unidade de medida no estoque

Status: aceito (2026-11-16). Spec: `docs/specs/estoque-unidades-categorias.md`.

## Contexto
Produto tinha N categorias (tabela implícita `_CategoryToProduct`) e as quantidades eram editadas tanto pelo formulário de produto quanto pelo estoque. Não havia unidade de medida.

## Decisão
1. `Product.categoryId` é obrigatório (FK `RESTRICT`). A relação N:N foi removida; a migração mantém a categoria de menor `createdAt` (empate por `slug`) e usa `sem-categoria` como fallback.
2. `MeasurementUnit` é um cadastro do módulo `inventory`. `Stock.unitId` é obrigatório (FK `RESTRICT`); a unidade padrão `un` tem id fixo `00000000-0000-4000-8000-000000000101` (usado por migração e seeds).
3. O `Stock` é o único dono das quantidades: todo produto nasce com exatamente um `Stock` 0/0 e quantidades/unidade só mudam pelas rotas de estoque. A unidade é um rótulo (sem conversão).
4. Categorias e unidades em uso não são excluídas, só desativadas; inativas não podem ser atribuídas de novo.

## Consequências
- Perda das categorias secundárias na migração (sem rollback automático; restaurar backup).
- Quebra de contrato `categories[]` → `category`: API e web publicadas juntas.
- Quantidades fracionárias, snapshot de unidade no pedido e remoção de `Variant` ficam como follow-up.
