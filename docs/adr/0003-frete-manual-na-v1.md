# ADR 0003 - Frete Manual na V1

> Superseded by [ADR 0007 - Frete Fixo por Regiao](0007-frete-fixo-por-regiao.md).

## Contexto

O frete pode ampliar muito a complexidade do MVP.

## Decisao

Usar frete manual ou fixo por regiao na v1.

## Razao

- Reduz dependencia de integracoes logisticas.
- Permite validar vendas antes de automatizar calculos.
- Simplifica o checkout inicial.

## Alternativas Consideradas

- Calculo automatico por transportadora.
- Integracao com Correios ou parceiro logistico.

## Impacto

- Menor complexidade no inicio.
- Operacao precisa de processo claro para manter consistencia.
- Futuramente pode evoluir para frete automatizado.
