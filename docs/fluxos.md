# Fluxos Principais

## Fluxo de Compra

1. Cliente acessa a home.
2. Cliente navega pelo catalogo.
3. Cliente abre a pagina do produto.
4. Cliente adiciona item ao carrinho.
5. Cliente revisa quantidade e subtotal.
6. Cliente segue para checkout.
7. Cliente informa dados de entrega.
8. Cliente escolhe Pix ou cartao.
9. Sistema cria pedido.
10. Sistema confirma a compra.

## Fluxo de Carrinho

1. Adicionar item.
2. Atualizar quantidade.
3. Remover item.
4. Recalcular subtotal, frete e total.

## Fluxo de Checkout

1. Validar dados de contato.
2. Validar endereco.
3. Validar disponibilidade de estoque.
4. Registrar forma de pagamento.
5. Criar pedido.
6. Encaminhar para pagamento.

## Fluxo de Pagamento

### Pix

1. Cliente escolhe Pix.
2. Sistema gera instrucoes de pagamento.
3. Pedido fica aguardando confirmacao.
4. Pagamento confirmado atualiza o status do pedido.

### Cartao

1. Cliente escolhe cartao.
2. Sistema envia a transacao ao gateway.
3. Sistema recebe aprovacao ou recusa.
4. Pedido segue para status adequado.

## Fluxo Administrativo

1. Operador entra no painel.
2. Cria ou edita produto.
3. Ajusta precos, imagens, variantes e estoque.
4. Consulta pedidos.
5. Atualiza status quando necessario.

## Fluxos de Excecao

- Estoque insuficiente bloqueia a conclusao do checkout.
- Falha de pagamento mantem o pedido em estado seguro.
- Produto inativo nao deve aparecer como compravel.
- Pedido cancelado nao deve permitir transicao invalida.

