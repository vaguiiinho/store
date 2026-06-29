# ADR 0012 - Reserva de Estoque com Expiracao

## Contexto

A loja vende produtos fisicos e precisa evitar sobre-venda, principalmente com pagamento pendente.

## Decisao

Reservar estoque no momento da criacao do pedido e liberar a reserva quando houver cancelamento ou expiracao.

## Razao

- Evita vender itens indisponiveis.
- Funciona bem com Pix, que pode ficar pendente por um tempo.
- Mantem o checkout consistente sem exigir confirmacao de pagamento imediata.

## Alternativas Consideradas

- Reservar somente no pagamento aprovado.
- Debitar estoque apenas ao final da separacao.

## Impacto

- O modelo de estoque precisa de quantidade disponivel e quantidade reservada.
- O sistema precisa de rotina de expiracao ou cleanup.
- O fluxo de pagamento precisa liberar a reserva em caso de recusa ou expiracao.

