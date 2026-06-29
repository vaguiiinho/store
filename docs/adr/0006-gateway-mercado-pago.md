# ADR 0006 - Gateway de Pagamento Mercado Pago

## Contexto

A loja virtual precisa aceitar Pix e cartao com suporte ao mercado brasileiro.

## Decisao

Usar Mercado Pago como gateway de pagamento da v1.

## Razao

- A documentacao oficial mostra suporte a meios de pagamento que incluem cartao e Pix.
- O projeto e focado em loja virtual brasileira.
- A integracao atende o escopo do MVP sem exigir construcoes proprias de pagamento.

## Alternativas Consideradas

- Stripe.
- Pagamento manual.
- Gateway proprio.

## Impacto

- O checkout dependera do fluxo e dos webhooks do provedor.
- A conciliacao de pagamento passara a seguir o contrato do gateway.
- A operacao ganha um caminho mais padronizado para Pix e cartao.

