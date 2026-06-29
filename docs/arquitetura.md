# Arquitetura

## Visao Geral

A loja virtual segue uma separacao simples entre experiencia do cliente, operacao interna e regras de negocio.

- Frontend: Next.js App Router.
- Backend: NestJS.
- Banco: PostgreSQL.
- ORM: Prisma.
- Testes: unitarios e integracao.

## Principios

- Server Components por padrao no frontend.
- Client Components somente quando houver interacao, estado ou uso de APIs do navegador.
- Regras de negocio fora de controllers.
- Persistencia isolada na camada de infraestrutura.
- Contratos claros entre frontend e backend.

## Componentes

| Componente | Responsabilidade |
| --- | --- |
| Frontend publico | Home, catalogo, produto, carrinho e checkout |
| Frontend administrativo | Produtos, pedidos e operacao interna |
| API de dominio | Produtos, estoque, pedidos, checkout e admin |
| Banco de dados | Persistencia de produtos, pedidos, clientes e pagamentos |
| Integracao de pagamento | Pix e cartao via Mercado Pago |
| Integracao de notificacao | Confirmacoes e atualizacoes de status |

## Separacao de Dominios

### Catalogo

Responsavel por exibir produtos, categorias, precos, imagens e disponibilidade.

### Carrinho e Checkout

Responsavel por montar a compra, validar dados de entrega e finalizar o pedido.

### Pedido e Pagamento

Responsavel por registrar pedidos, estados, pagamentos e confirmacoes.

### Admin

Responsavel por operacao de produtos, estoque e pedidos.

## Fluxo Tecnico

1. O cliente navega no frontend.
2. O frontend consulta a API para catalogo e checkout.
3. A API valida regras de dominio.
4. A camada de aplicacao executa o caso de uso.
5. A infraestrutura persiste os dados no banco e chama servicos externos quando necessario.
6. O frontend exibe o resultado e os estados de sucesso ou erro.

## Decisoes Relevantes

- Next.js com foco em SEO, performance e composicao de paginas.
- NestJS para organizar regras, validacao e integracoes.
- PostgreSQL como banco principal.
- Prisma como acesso ao banco.
- Arquitetura preparada para expandir frete, pagamento e notificacoes sem reescrever o dominio.

## Riscos

- Integracoes externas podem introduzir dependencia operacional.
- Fluxos de pagamento exigem tratamento cuidadoso de erros e status.
- Estoque precisa ser consistente para evitar overbooking.
- UI e checkout precisam ser leves para reduzir abandono.

## Abstrações de Integracao

### E-mail

- O dominio nao deve depender diretamente de Gmail, Resend ou qualquer provedor.
- A integracao deve passar por um `EmailGateway`.
- O MVP pode usar Gmail free.
- O provedor futuro recomendado e Resend.
