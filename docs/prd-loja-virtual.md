# PRD - Loja Virtual

## Visao do Produto

Construir uma loja virtual de produtos fisicos com experiencia simples de compra, pagamento por Pix e cartao via Mercado Pago, frete fixo por regiao e painel administrativo para operacao da loja.

## Objetivo

Permitir que clientes encontrem produtos, adicionem itens ao carrinho, concluam pedidos e recebam confirmacao, enquanto a equipe administra catalogo, estoque e pedidos em um painel interno.

## Publico-Alvo

- Clientes finais que compram produtos fisicos online.
- Equipe interna responsavel por cadastro de produtos, acompanhamento de pedidos e operacao da loja.

## Problema que Resolve

Hoje a operacao de venda precisa de um canal digital simples e confiavel para:

- apresentar catalogo;
- processar pedidos;
- registrar pagamentos;
- controlar estoque;
- acompanhar status das vendas.

## Objetivos de Negocio

- Vender produtos fisicos online.
- Reduzir atrito no fluxo de compra.
- Centralizar catalogo, pedidos e estoque em um unico sistema.
- Permitir operacao minima da loja sem dependencias de ferramentas externas.

## Escopo da V1

### Inclui

- Home com destaque de produtos.
- Catalogo com listagem, busca e filtros basicos.
- Pagina de produto.
- Carrinho.
- Checkout.
- Pagamento por Pix e cartao via Mercado Pago.
- Criacao de pedido.
- Pagina de confirmacao.
- Painel admin para produtos e pedidos.
- Controle basico de estoque.
- Frete fixo por regiao.

### Nao inclui

- Marketplace.
- Cupons.
- Avaliacoes.
- Cálculo automatico de frete.
- Programa de fidelidade.
- Recomendacao personalizada.
- Assinaturas.

## Requisitos Funcionais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF-01 | Exibir home com produtos em destaque e chamadas para compra | Alta |
| RF-02 | Listar produtos com busca e filtros basicos | Alta |
| RF-03 | Exibir pagina detalhada do produto | Alta |
| RF-04 | Permitir adicionar, remover e alterar quantidade no carrinho | Alta |
| RF-05 | Permitir checkout com nome, contato, endereco e frete | Alta |
| RF-06 | Permitir pagamento por Pix e cartao via Mercado Pago | Alta |
| RF-07 | Criar pedido com numero, status e resumo | Alta |
| RF-08 | Exibir pagina de sucesso apos compra | Alta |
| RF-09 | Permitir admin criar, editar, ativar e desativar produtos | Alta |
| RF-10 | Permitir admin gerenciar imagens, preco, estoque e variacoes | Alta |
| RF-11 | Permitir admin acompanhar e atualizar status de pedidos | Alta |
| RF-12 | Controlar estoque para evitar venda acima do disponivel | Alta |
| RF-13 | Registrar notificacao de confirmacao e mudanca de status | Media |
| RF-14 | Exibir historico de pedidos ao cliente se conta estiver habilitada | Baixa |

## Requisitos Nao Funcionais

- Performance aceitavel para navegacao de catalogo e checkout.
- Interface responsiva para desktop e mobile.
- Validacao de entrada em formularios e endpoints.
- Persistencia consistente para pedidos e estoque.
- Estrutura tecnica manutemivel.
- Logs sem expor dados sensiveis.

## Personas

### Cliente

- Quer encontrar produtos rapidamente.
- Espera checkout simples e confiavel.
- Precisa receber confirmacao clara do pedido.

### Operador da loja

- Cadastra produtos e atualiza estoque.
- Acompanha pedidos.
- Altera status de pedidos quando necessario.

## Jornadas Principais

### Jornada de compra

1. Cliente acessa a home.
2. Navega pelo catalogo.
3. Abre a pagina do produto.
4. Adiciona item ao carrinho.
5. Vai para o checkout.
6. Informa dados de entrega.
7. Escolhe Pix ou cartao.
8. Finaliza o pedido.
9. Recebe confirmacao.

### Jornada administrativa

1. Operador acessa o painel admin.
2. Cadastra ou atualiza produto.
3. Ajusta estoque e variacoes.
4. Acompanha pedidos.
5. Atualiza status conforme operacao.

## Dados Principais

- Produto
- Categoria
- Variante
- Estoque
- Carrinho
- Pedido
- Item de pedido
- Cliente
- Endereco
- Pagamento
- Status de pedido

## Metricas de Sucesso

- Taxa de conversao do checkout.
- Numero de pedidos concluídos.
- Taxa de abandono de carrinho.
- Tempo medio para finalizar pedido.
- Numero de pedidos com falha de pagamento.

## Riscos

- Integracao de pagamento pode atrasar a entrega.
- Regra de estoque mal definida pode gerar venda indevida.
- Frete fixo por regiao pode gerar inconsistencias se nao houver processo claro.
- Escopo excessivo pode comprometer a entrega do MVP.

## Decisoes de Arquitetura

- Frontend em Next.js com Server Components por padrao.
- Backend em NestJS com Clean Architecture e DDD.
- Banco em PostgreSQL com Prisma.
- Catalogo, checkout, pedidos e admin separados por dominio.

## Critérios de Aceite da V1

- Cliente consegue navegar, escolher produto e finalizar compra.
- Admin consegue gerenciar produtos e acompanhar pedidos.
- Estoque nao permite vender acima do disponivel.
- Pagamento por Pix e cartao via Mercado Pago esta suportado.
- Pedido fica registrado com status rastreavel.

## Perguntas em Aberto

- Conta de cliente sera obrigatoria ou opcional na v1?
- Qual politica exata de reserva de estoque sera aplicada?
- Haverá notificacao por e-mail ja no MVP?
