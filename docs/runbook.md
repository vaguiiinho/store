# Runbook

## Objetivo

Orientar operacao e suporte da loja virtual em cenarios previsiveis.

## Cenarios Criticos

### Falha de pagamento

1. Verificar status da transacao no gateway.
2. Confirmar se o pedido ficou em estado seguro.
3. Reprocessar ou orientar o cliente conforme a regra da operacao.

### Pedido duplicado

1. Confirmar origem da duplicidade.
2. Validar se existe retry da integracao ou duplo clique no checkout.
3. Cancelar pedido indevido conforme politica interna.

### Estoque divergente

1. Verificar se houve venda concorrente.
2. Corrigir estoque no admin.
3. Ajustar a regra de reserva se necessario.

### Produto indisponivel no catalogo

1. Verificar se o produto esta ativo.
2. Verificar se houve problema de publicacao ou estoque.
3. Reativar somente se o item estiver apto para venda.

### Notificacao nao enviada

1. Verificar fila ou integracao externa.
2. Reexecutar notificacao se a operacao permitir.
3. Registrar falha para analise posterior.

## Responsabilidades

- Time de negocio: validar pedido e atendimento ao cliente.
- Time tecnico: investigar falha, corrigir causa e registrar decisao.

