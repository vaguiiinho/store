# Implementacao - Tasks

## Objetivo

Transformar o PRD da loja virtual em entregas executaveis, com fatias pequenas e ordem clara.

## Fase 1 - Fundacao

- Definir a estrutura inicial do frontend e backend.
- Criar layout base da aplicacao.
- Configurar rotas principais.
- Configurar persistencia e modelo inicial do banco.
- Preparar validacao, tratamento de erros e convencoes de codigo.

## Fase 2 - Catalogo

- Criar listagem de produtos.
- Criar busca e filtros basicos.
- Criar pagina de produto.
- Exibir estado de carregamento, vazio e erro.
- Garantir responsividade no mobile.

## Fase 3 - Carrinho

- Implementar adicionar item ao carrinho.
- Implementar remover item.
- Implementar alterar quantidade.
- Calcular subtotal.
- Manter estado do carrinho de forma previsivel.

## Fase 4 - Checkout

- Criar formulario de checkout.
- Validar nome, contato e endereco.
- Exibir frete fixo por regiao.
- Permitir escolha de Pix e cartao via Mercado Pago.
- Registrar pedido ao concluir a compra.

## Fase 5 - Pagamento e Pedido

- Integrar fluxo de pagamento.
- Criar status inicial do pedido.
- Exibir pagina de sucesso.
- Exibir resumo da compra.
- Preparar base para notificacao de confirmacao.

## Fase 6 - Admin

- Criar area administrativa.
- Permitir CRUD de produtos.
- Permitir ativacao e desativacao de produtos.
- Permitir ajuste de imagens, preco, variacoes e estoque.
- Listar pedidos.
- Alterar status do pedido.

## Fase 7 - Qualidade

- Cobrir regras de dominio com testes unitarios.
- Cobrir casos de uso com testes de aplicacao.
- Cobrir endpoints principais com testes de integracao.
- Cobrir fluxos criticos de interface com testes adequados.
- Revisar criterios de aceite.

## Backlog Inicial

### Produto e Catalogo

- Criar entidade Produto.
- Criar entidade Categoria.
- Criar listagem publica.
- Criar pagina de detalhe.

### Carrinho e Checkout

- Criar entidade Carrinho.
- Criar fluxo de checkout.
- Criar validacao de endereco.
- Criar validacao de forma de pagamento.

### Pedido e Pagamento

- Criar entidade Pedido.
- Criar item de pedido.
- Criar status de pedido.
- Integrar pagamento por Pix e cartao via Mercado Pago.

### Admin

- Criar tela de listagem de produtos.
- Criar tela de edicao de produto.
- Criar tela de pedidos.
- Criar acao de atualizacao de status.

## Ordem Recomendada de Execucao

1. Estrutura e fundacao.
2. Dominio e persistencia.
3. Catalogo publico.
4. Carrinho.
5. Checkout e pedido.
6. Admin.
7. Testes e refinamento.

## Agentes Recomendados

- `architect` para refinar escopo e prioridades.
- `nestjs-backend` para dominio, API e persistencia.
- `nextjs-frontend` para paginas e componentes.
- `qa` para estrategia de testes e regressao.
- `reviewer` para revisao final.

## Observacoes

- Manter cada task pequena e verificavel.
- Evitar misturar frontend, backend e teste na mesma task quando possivel.
- Se uma dependencia externa bloquear a entrega, criar task separada para integracao.
