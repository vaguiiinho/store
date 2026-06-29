# ADR 0007 - Frete Fixo por Regiao

## Contexto

O frete pode atrasar a entrega se a v1 tentar automatizar demais.

## Decisao

Usar frete fixo por regiao, configurado manualmente no admin.

## Razao

- Mantem o checkout simples.
- Permite controlar margem e cobertura de entrega.
- Evita dependencia de integracao logistica logo no inicio.

## Alternativas Consideradas

- Frete fixo unico.
- Calculo automatizado por transportadora.
- Retirada local apenas.

## Impacto

- O admin precisa manter a tabela de regioes e valores.
- O checkout precisa aplicar a regra de forma deterministica.
- Futuramente pode evoluir para cotacao automatica.

