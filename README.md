# Store — E-commerce Full Stack

Aplicação Full Stack de e-commerce desenvolvida com **Next.js, NestJS, PostgreSQL e Prisma**, estruturada em monorepo e preparada para evolução de funcionalidades de catálogo, estoque, carrinho, pedidos e pagamentos.

O projeto faz parte do meu portfólio e tem como objetivo demonstrar desenvolvimento Full Stack, modelagem de domínio, APIs, persistência de dados e organização de uma aplicação moderna.

---

## 🚀 Tecnologias

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- NestJS
- TypeScript
- Prisma ORM

### Banco de dados
- PostgreSQL

### Ferramentas
- npm Workspaces
- ESLint
- Prettier
- Prisma Migrations

---

## 📌 Funcionalidades

O domínio da aplicação contempla:

- catálogo de produtos;
- categorias;
- variações de produtos;
- gerenciamento de estoque;
- clientes;
- endereços;
- carrinho de compras;
- criação de pedidos;
- itens do pedido;
- controle de status dos pedidos;
- pagamentos;
- suporte a PIX e cartão.

---

## 🛒 Fluxo principal

A aplicação foi estruturada para suportar um fluxo tradicional de e-commerce:

```text
Catálogo
   ↓
Produto
   ↓
Carrinho
   ↓
Cliente / Endereço
   ↓
Pedido
   ↓
Pagamento
   ↓
Preparação
   ↓
Envio
   ↓
Entrega
