# ADR 0004 - Pagamento via Gateway Externo

> Superseded by [ADR 0006 - Gateway de Pagamento Mercado Pago](0006-gateway-mercado-pago.md).

## Contexto

A loja precisa aceitar Pix e cartao sem construir um sistema proprio de pagamentos.

## Decisao

Integrar um gateway externo de pagamento.

## Razao

- Reduz risco de seguranca.
- Simplifica conformidade e conciliacao.
- Permite suportar Pix e cartao com uma integracao padrao.

## Alternativas Consideradas

- Implementar pagamento proprio.
- Aceitar somente pagamento manual.

## Impacto

- Menor responsabilidade sobre dados sensiveis de pagamento.
- Dependencia de provedor externo.
- Necessidade de tratamento de falhas e reprocessamento.
