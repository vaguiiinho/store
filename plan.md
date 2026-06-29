# Loja Virtual - Requisitos e Plano de Ação

## Resumo

Criar uma loja virtual de produtos fisicos com MVP simples, pagamento por Pix e cartao, frete fixo/manual e painel administrativo para produtos e pedidos.

A base arquitetural segue o padrao deste repositorio:

- frontend em Next.js App Router;
- backend em NestJS com Clean Architecture e DDD;
- persistencia em PostgreSQL com Prisma.

## Requisitos Funcionais

- Home com destaque de produtos, categorias e chamadas para compra.
- Catalogo de produtos com listagem, busca e filtros basicos.
- Pagina de produto com fotos, descricao, preco, variacoes e disponibilidade.
- Carrinho de compras com adicionar, remover, alterar quantidade e calcular subtotal.
- Checkout com identificacao do cliente, endereco, frete e forma de pagamento.
- Pagamento por Pix e cartao.
- Criacao de pedido com numero, status e resumo da compra.
- Confirmacao de pedido e pagina de sucesso.
- Notificacao de confirmacao de compra e atualizacao de status.
- Area administrativa para:
  - criar, editar, ativar e desativar produtos;
  - gerenciar imagens, preco, estoque e variacoes;
  - acompanhar pedidos e alterar status;
  - visualizar informacoes basicas de clientes e compras.
- Historico de pedidos para o cliente, se houver conta no MVP.
- Politica de frete manual ou fixo por regiao.
- Controle basico de estoque para evitar venda acima do disponivel.
- Cupons, avaliacoes e calculo automatico de frete ficam fora da v1, salvo necessidade explicita.

## Plano de Ação

1. Definir o escopo fechado da v1
   - Confirmar que a loja sera de produtos fisicos.
   - Manter MVP simples.
   - Usar Pix e cartao.
   - Aplicar frete fixo/manual.
   - Ter painel admin para produtos e pedidos.

2. Fechar o dominio do negocio
   - Modelar entidades principais: Produto, Categoria, Variante, Estoque, Carrinho, Pedido, Item de Pedido, Cliente, Endereco, Pagamento e Status de Pedido.
   - Definir regras de negocio para estoque, preco, status e checkout.
   - Definir quais dados serao obrigatorios no cadastro do pedido.

3. Planejar a arquitetura
   - Frontend: Next.js com foco em Server Components.
   - Backend: NestJS com Clean Architecture e DDD.
   - Persistencia: PostgreSQL com Prisma.
   - Separar claramente catalogo, carrinho, checkout, pedidos e admin.

4. Desenhar os fluxos principais
   - Navegacao da home ate o checkout.
   - Fluxo de adicao ao carrinho.
   - Fluxo de pagamento.
   - Fluxo de criacao e acompanhamento de pedido.
   - Fluxo administrativo de cadastro de produto e atualizacao de pedido.

5. Especificar integracoes
   - Pagamento via gateway compativel com Pix e cartao.
   - Frete manual/fixo na v1.
   - Notificacoes por e-mail na confirmacao e mudanca de status, se fizer parte do escopo inicial.

6. Implementar por fatias
   - Base de layout e navegacao.
   - Catalogo e produto.
   - Carrinho.
   - Checkout.
   - Pedido e confirmacao.
   - Admin de produtos.
   - Admin de pedidos.
   - Testes e revisao final.

## Plano de Testes

- Testes de dominio para regras de estoque, pedido e status.
- Testes de use case para checkout, criacao de pedido e atualizacao de status.
- Testes de integracao para API de produtos, pedidos e admin.
- Testes de interface para catalogo, carrinho e checkout.

### Cenários minimos

- adicionar produto ao carrinho;
- remover e alterar quantidade;
- bloquear compra quando estoque insuficiente;
- finalizar pedido com Pix;
- finalizar pedido com cartao;
- aplicar frete manual;
- alterar status do pedido no admin;
- listar pedidos no admin.

## Assunções

- Loja de produtos fisicos.
- MVP simples, nao marketplace.
- Pagamento com Pix e cartao.
- Frete manual/fixo na primeira versao.
- Painel admin para produtos e pedidos.
- Conta de cliente opcional no MVP, com checkout simples.

## Proximos passos

1. Validar se o escopo acima esta correto.
2. Fechar o modelo de dominio da v1.
3. Detalhar telas, endpoints e entidades.
4. Separar as tarefas por agente:
   - `architect` para refinamento de escopo;
   - `backend` ou `nestjs-backend` para API e dominio;
   - `frontend` ou `nextjs-frontend` para interface;
   - `qa` para cenarios de teste;
   - `reviewer` para revisao final.
