# API

## Objetivo

Documentar os contratos esperados da API da loja virtual antes da implementacao.

## Recursos Publicos

| Recurso | Uso |
| --- | --- |
| `GET /products` | Listar produtos |
| `GET /products/:id` | Detalhar produto |
| `GET /categories` | Listar categorias |
| `POST /cart` | Criar ou atualizar carrinho |
| `POST /checkout` | Iniciar checkout |
| `POST /orders` | Criar pedido |
| `GET /orders/:id` | Consultar pedido |

## Recursos Administrativos

| Recurso | Uso |
| --- | --- |
| `POST /admin/products` | Criar produto |
| `PATCH /admin/products/:id` | Atualizar produto |
| `PATCH /admin/products/:id/status` | Ativar ou desativar produto |
| `PATCH /admin/products/:id/stock` | Ajustar estoque |
| `GET /admin/orders` | Listar pedidos |
| `PATCH /admin/orders/:id/status` | Atualizar status do pedido |

## Contratos Esperados

### Produto

- nome
- descricao
- preco
- imagens
- categorias
- variantes
- estoque

### Checkout

- cliente
- endereco
- itens
- frete
- pagamento

### Pedido

- numero
- status
- itens
- subtotal
- frete
- total
- pagamento

## Regras de Erro

- `400` para dados invalidos.
- `401` para usuario nao autenticado, quando aplicavel.
- `403` para acesso negado.
- `404` para recurso inexistente.
- `409` para conflito de estoque ou estado.
- `422` para regra de negocio invalida.
- `500` para falhas inesperadas.

## Observacoes

- Os payloads detalhados devem ser refinados quando o backend for implementado.
- A documentacao final da API pode virar OpenAPI quando o projeto iniciar.

