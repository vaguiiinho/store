# Loja Ritual

Demo de portfólio de uma loja virtual de produtos físicos.

A proposta é mostrar uma jornada simples e apresentável:

- vitrine pública com catálogo, carrinho e checkout;
- pedido confirmado com resumo, frete e pagamento simulado;
- admin com acesso autenticado para pedidos e produtos;
- base preparada para evoluir sem reescrever o fluxo principal.

## O que a demo cobre

- home com proposta clara e destaque para produtos;
- catálogo com busca e filtro por categoria;
- detalhe do produto com ação de adicionar ao carrinho;
- carrinho com subtotal, frete e total;
- checkout como visitante;
- confirmação do pedido com resumo da compra;
- painel admin para consulta e operação básica.

## Stack

- Frontend: Next.js App Router
- Backend: NestJS
- ORM: Prisma
- Banco: PostgreSQL
- Pagamento: Mercado Pago
- Imagens: Cloudinary
- E-mail transacional: Gmail free no MVP

## Rotas principais

- `/` - home da demo
- `/catalogo` - catálogo público
- `/produto/[slug]` - detalhe do produto
- `/carrinho` - resumo do carrinho
- `/checkout` - checkout visitante
- `/pedido/[number]` - confirmação do pedido
- `/admin` - painel administrativo

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Suba o PostgreSQL e os serviços locais:

```bash
docker compose up -d
```

3. Inicie os apps:

```bash
npm run dev
```

Se preferir executar separado:

```bash
npm run dev:web
npm run dev:api
```

## Documentação

- [docs/README.md](docs/README.md)
- [docs/demo-apresentacao.md](docs/demo-apresentacao.md)
- [docs/prd-loja-virtual.md](docs/prd-loja-virtual.md)
- [docs/ambiente.md](docs/ambiente.md)
- [docs/implementacao-tasks.md](docs/implementacao-tasks.md)
- [docs/checklist-prs.md](docs/checklist-prs.md)
- [docs/pre-requisitos-implementacao.md](docs/pre-requisitos-implementacao.md)
- [docs/plano-implementacao-v1.md](docs/plano-implementacao-v1.md)
- [docs/backlog-tecnico-v1.md](docs/backlog-tecnico-v1.md)

## Contexto do repositório

O repositório também mantém a documentação de agentes e decisões técnicas que orientam as próximas etapas da v1.

- [.agents/README.md](.agents/README.md)
- [.agents/agent-router.md](.agents/agent-router.md)
- [.agents/project-architecture.md](.agents/project-architecture.md)
