# Pre-requisitos para Iniciar a Implementacao

Este documento resume o que precisa estar decidido antes de começar a codificar a loja virtual.

## Ja pode ser assumido

- Loja de produtos fisicos.
- MVP simples.
- Frontend com Next.js App Router.
- Backend com NestJS.
- Banco PostgreSQL em container Docker.
- ORM Prisma.
- Pagamento por Pix e cartao via Mercado Pago.
- Frete fixo por regiao.
- Painel admin para produtos e pedidos.

## Decisoes Operacionais Fechadas

- Regras de estoque: reserva na criacao do pedido com expiracao.
- Pagamento aprovado: pedido vai para `pago`.
- Pagamento pendente: pedido fica em `aguardando_pagamento`.
- Pagamento recusado: pedido vai para `cancelado` e libera o estoque reservado.
- Pix na v1: envio de instrucoes e confirmacao via webhook do gateway.
- Admin na v1: lista de produtos, edicao de produto, imagens, preco, estoque, variacoes, lista de pedidos, detalhe do pedido e atualizacao de status.
- Variaveis de ambiente reais: `DATABASE_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL`, `API_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `PAYMENT_PROVIDER_KEY`, `PAYMENT_PROVIDER_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `RESEND_API_KEY` (futuro), `STORAGE_BUCKET`.

## Decisoes Minimas para Liberar o Inicio

1. Confirmar o escopo da v1.

## Decisoes Fechadas

As decisoes abaixo foram fechadas para a v1:

- Gateway de pagamento: Mercado Pago.
- Regra de frete: frete fixo por regiao, configurado manualmente no admin.
- Estrategia de conta de cliente: checkout como visitante na v1, com conta opcional no futuro.
- Autenticacao do admin: email e senha com sessao segura em cookie httpOnly e papel `admin`.
- Estrutura de estoque: reserva no momento da criacao do pedido, com expiracao para liberar quantidade.
- E-mail transacional: Gmail free via SMTP com app password.
- E-mail futuro recomendado: Resend.
- Armazenamento de imagens: Cloudinary.
- Comandos oficiais do projeto: `npm install`, `npm run dev`, `npm test`, `npm run lint`, `npm run format`, `npm run build`.

## Ordem Recomendada para Iniciar

1. Fechar as decisoes restantes.
2. Criar o scaffold do projeto.
3. Implementar arquitetura base.
4. Implementar dominio e persistencia.
5. Subir catalogo, carrinho, checkout e pedido.
6. Finalizar admin e testes.

## Sinal de que esta pronto para codar

- PRD aprovado.
- Tasks definidas.
- Arquitetura documentada.
- Regras de negocio sem ambiguidade relevante.
- Dependencias externas escolhidas ou assumidas.
