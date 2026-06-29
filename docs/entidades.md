# Entidades de Dominio

## Visao Geral

Este documento registra as entidades centrais da loja virtual e seus papeis no dominio.

## Entidades Principais

| Entidade | Responsabilidade |
| --- | --- |
| Produto | Representa o item vendido |
| Categoria | Organiza produtos em grupos |
| Variante | Representa opcao de cor, tamanho ou outra combinacao |
| Estoque | Controla quantidade disponivel |
| Carrinho | Agrupa itens antes do checkout |
| Pedido | Registra a compra concluida ou em andamento |
| Item de Pedido | Detalha cada produto dentro do pedido |
| Cliente | Representa quem compra |
| Endereco | Local de entrega |
| Pagamento | Registra a forma e o status do pagamento |
| Status de Pedido | Controla a etapa atual do pedido |

## Detalhamento

### Produto

Campos esperados:

- id
- nome
- descricao
- preco
- ativo
- imagens
- categorias
- variantes
- estoque

### Categoria

Campos esperados:

- id
- nome
- slug
- ativo

### Variante

Campos esperados:

- id
- nome
- valor
- sku opcional
- ativo

### Estoque

Campos esperados:

- id
- produtoId
- varianteId opcional
- quantidadeDisponivel
- quantidadeReservada

### Carrinho

Campos esperados:

- id
- clienteId opcional
- itens
- subtotal
- frete
- total

### Pedido

Campos esperados:

- id
- numero
- clienteId opcional
- enderecoEntrega
- itens
- subtotal
- frete
- total
- status
- pagamento
- criadoEm

### Item de Pedido

Campos esperados:

- id
- pedidoId
- produtoId
- varianteId opcional
- nomeDoProduto
- quantidade
- precoUnitario
- totalItem

### Cliente

Campos esperados:

- id
- nome
- email opcional
- telefone
- documento opcional

### Endereco

Campos esperados:

- id
- cep
- rua
- numero
- complemento opcional
- bairro
- cidade
- estado
- referencia opcional

### Pagamento

Campos esperados:

- id
- pedidoId
- metodo
- status
- valor
- transacaoExterna opcional

### Status de Pedido

Valores sugeridos:

- criado
- aguardando_pagamento
- pago
- em_separacao
- enviado
- entregue
- cancelado

## Relacionamentos

- Um produto pode ter varias variantes.
- Um produto pertence a uma ou mais categorias.
- Um pedido tem varios itens.
- Um pedido possui um pagamento principal.
- Um cliente pode ter varios pedidos.
- Um endereco pode ser reutilizado por mais de um pedido se a regra de negocio permitir.

