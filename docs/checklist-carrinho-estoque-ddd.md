# Checklist — carrinho, estoque e domínio

## Backend

- [x] Validar DTO de criação de pedido e quantidade mínima de itens.
- [x] Validar quantidades de estoque não negativas e inteiras no domínio.
- [x] Reservar estoque de forma atômica na criação do pedido.
- [x] Recusar pedido quando não houver saldo disponível.
- [x] Expor quantidade disponível e reservada no catálogo.
- [x] Usar objetos de valor para dinheiro, quantidade e texto obrigatório.
- [x] Mover mudanças de estado recorrentes para métodos das entidades.
- [x] Adicionar expiração automática das reservas pendentes.
- [x] Cobrir regras críticas de entidades com testes unitários.

## Frontend

- [x] Exibir carrinho como ícone na navegação.
- [x] Exibir badge com a quantidade total de itens.
- [x] Impedir que o carrinho ultrapasse a disponibilidade conhecida do produto.
- [x] Mostrar estoque disponível no catálogo.
- [x] Limpar o carrinho somente após pedido criado com sucesso.
- [x] Executar leituras em Server Components por meio da camada de serviços.
- [x] Executar escritas por Server Actions.
- [x] Centralizar todas as requisições HTTP em `apps/web/src/services` com `apiClient` tipado.

## Validação final

- [x] Executar `npm run build:api` e `npm run build:web`.
- [x] Validar manualmente: adicionar, alterar quantidade, finalizar pedido e conferir a redução no catálogo (roteiro abaixo).
- [x] Validar manualmente login e operações administrativas via Server Actions (roteiro abaixo).

## Roteiro de validação manual

1. Inicie a stack e abra `/catalogo`; anote o estoque de um produto.
2. Adicione o produto até o limite: o carrinho não pode exceder a quantidade exibida e o badge deve refletir os itens.
3. Conclua um checkout válido; recarregue o catálogo e confirme que a disponibilidade caiu pela quantidade comprada.
4. Crie um pedido pendente e aguarde o vencimento do pagamento; em até um minuto a reserva deve ser liberada e o pedido cancelado.
5. Entre em `/admin/login`, atualize um pedido e um produto e recarregue as páginas para confirmar a sessão e a persistência.
