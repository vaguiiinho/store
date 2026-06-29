# Plano de Implementacao da V1

Este plano organiza a primeira entrega da loja virtual em fatias pequenas, com dependencias claras e criterio de saida por fase.

## Objetivo da V1

Entregar uma loja virtual funcional para produtos fisicos, com:

- catalogo publico;
- carrinho;
- checkout como visitante;
- pagamento via Mercado Pago;
- frete fixo por regiao;
- e-mail transacional via Gmail free;
- painel admin para produtos e pedidos;
- imagens no Cloudinary;
- base tecnica em Next.js, NestJS, PostgreSQL e Prisma.

## Premissas Ja Fechadas

- Loja de produtos fisicos.
- MVP simples.
- Pagamento por Pix e cartao via Mercado Pago.
- Frete fixo por regiao.
- Checkout como visitante.
- Admin com email, senha, cookie `httpOnly` e papel `admin`.
- E-mail transacional via Gmail free SMTP.
- Upload e entrega de imagens via Cloudinary.
- Comandos oficiais com `npm`.

## Ordem de Implementacao

### Fase 1 - Fundacao

Entregas:

- estrutura do frontend e backend;
- layout base;
- rotas principais;
- configuracao do banco e ambiente;
- validacao e tratamento de erros basicos.

Saida esperada:

- projeto sobe localmente;
- frontend e backend conversam de forma minima;
- ambiente e scripts padronizados funcionam.

### Fase 2 - Dominio e Persistencia

Entregas:

- modelagem das entidades principais;
- contratos de repositorio;
- estrutura de casos de uso;
- migrations iniciais;
- base de estoques e pedidos.

Saida esperada:

- dominio central da loja representado;
- acesso ao banco isolado na infraestrutura;
- regras centrais testaveis sem interface.

### Fase 3 - Catalogo Publico

Entregas:

- home;
- listagem de produtos;
- pagina de produto;
- busca e filtros basicos;
- estados de loading, vazio e erro.

Saida esperada:

- cliente consegue navegar e avaliar produtos.

### Fase 4 - Carrinho

Entregas:

- adicionar item;
- remover item;
- alterar quantidade;
- calcular subtotal;
- manter o estado do carrinho consistente.

Saida esperada:

- cliente consegue montar a compra antes do checkout.

### Fase 5 - Checkout e Pedido

Entregas:

- formulario de checkout;
- validacao de contato e endereco;
- regra de frete por regiao;
- criacao do pedido;
- pagina de sucesso;
- resumo do pedido.

Saida esperada:

- pedido nasce em estado correto e visivel ao usuario.

### Fase 6 - Pagamento

Entregas:

- integracao com Mercado Pago;
- fluxo de Pix;
- fluxo de cartao;
- tratamento de aprovado, pendente e recusado;
- base para webhooks e confirmacao.
- envio de e-mails transacionais.

Saida esperada:

- pedido muda de estado a partir do pagamento real.

### Fase 7 - Admin

Entregas:

- autenticacao do admin;
- CRUD de produtos;
- ativacao e desativacao de produtos;
- edicao de imagens, preco, variacoes e estoque;
- listagem de pedidos;
- atualizacao de status.

Saida esperada:

- operacao interna consegue manter catalogo e pedidos.

### Fase 8 - Qualidade

Entregas:

- testes unitarios de dominio;
- testes de casos de uso;
- testes de integracao;
- testes de fluxos criticos de interface;
- revisao final de regressao.

Saida esperada:

- v1 com cobertura suficiente para operar sem surpresa.

## Dependencias Entre Fases

- Fase 2 depende da Fase 1.
- Fase 3 depende da Fase 2.
- Fase 4 depende da Fase 3.
- Fase 5 depende da Fase 4.
- Fase 6 depende da Fase 5.
- Fase 7 depende da Fase 2 e da Fase 6.
- Fase 8 depende de todas as fases anteriores.

## Criterios Para Considerar a V1 Pronta

- Cliente consegue navegar, escolher produto e finalizar compra.
- Mercado Pago conclui Pix e cartao com status rastreavel.
- Frete fixo por regiao funciona sem ambiguidade.
- Admin consegue operar produtos e pedidos.
- Estoque nao permite venda acima do disponivel.
- Documentacao e tarefas estao alinhadas com o que foi implementado.

## Sequencia Recomendada de PRs

1. Fundacao.
2. Dominio e persistencia.
3. Catalogo.
4. Carrinho.
5. Checkout e pedido.
6. Pagamento.
7. Admin.
8. Qualidade.

## Agentes Para Cada Etapa

- `architect`: refinar escopo e quebrar risco tecnico.
- `nestjs-backend`: dominio, API, persistencia e integracao de pagamento.
- `nextjs-frontend`: catalogo, carrinho, checkout e admin.
- `qa`: criterios de aceite e cobertura.
- `reviewer`: revisao final antes de fechar cada fase.
