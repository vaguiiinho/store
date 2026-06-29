# ADR 0005 - Status de Pedido

## Contexto

O pedido precisa de estados claros para checkout, pagamento e operacao.

## Decisao

Adotar um fluxo simples de status:

- criado
- aguardando_pagamento
- pago
- em_separacao
- enviado
- entregue
- cancelado

## Razao

- Facilita leitura operacional.
- Evita transicoes ambíguas.
- Ajuda suporte, admin e automacao.

## Alternativas Consideradas

- Estados livres sem padrao.
- Fluxo mais granular desde a v1.

## Impacto

- Regras de transicao precisam ser validadas.
- Admin e backend compartilham a mesma linguagem de operacao.

