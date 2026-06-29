# Agent Instructions

Este arquivo e a entrada principal para agentes neste repositorio.

## Como usar

1. Leia `.agents/agent-router.md` para escolher o agente certo.
2. Leia `.agents/operating-principles.md` antes de mudar arquivos.
3. Leia `.agents/project-architecture.md` quando a tarefa envolver Next.js, NestJS, Prisma ou PostgreSQL.
4. Use `.agents/templates/` para briefings e revisoes.
5. Consulte `docs/README.md` e `docs/pre-requisitos-implementacao.md` antes de iniciar implementacao.

## Contexto do projeto

Decisoes ja fechadas para a v1:

- loja de produtos fisicos;
- MVP simples;
- frontend em Next.js App Router;
- backend em NestJS;
- banco PostgreSQL;
- ORM Prisma;
- pagamento via Mercado Pago;
- frete fixo por regiao;
- checkout como visitante;
- admin com email, senha, cookie httpOnly e papel `admin`;
- imagens no Cloudinary;
- comandos oficiais com `npm`;
- PostgreSQL em container Docker;
- e-mail transacional via Gmail free no MVP;
- provedor futuro recomendado para e-mail: Resend;
- estoque com reserva na criacao do pedido e expiracao.

## Regra geral

- Prefira mudancas pequenas e verificaveis.
- Preserve o estilo existente.
- Nao reescreva partes grandes sem necessidade.
- Valide com testes, lint ou checagens equivalentes quando existirem.
- Se nao for possivel validar, diga isso claramente.

## Agentes disponiveis

- `architect`: escopo, arquitetura, trade-offs e plano tecnico.
- `backend`: APIs, dominio, dados e integracoes.
- `frontend`: interface, UX e componentes.
- `nestjs-backend`: NestJS, Prisma, PostgreSQL, Clean Architecture e DDD.
- `nextjs-frontend`: Next.js App Router, Server Components, Client Components e Tailwind.
- `qa`: testes e validacao.
- `reviewer`: revisao critica de codigo.
- `security`: seguranca, privacidade e ameacas.

## Padrao de entrega

Ao concluir uma tarefa, informe:

- o que foi alterado;
- onde foi alterado;
- como foi verificado;
- limites ou proximos passos relevantes.

## Leitura adicional

- [README.md](README.md)
- [docs/README.md](docs/README.md)
- [docs/ambiente.md](docs/ambiente.md)
- [docs/prd-loja-virtual.md](docs/prd-loja-virtual.md)
- [docs/implementacao-tasks.md](docs/implementacao-tasks.md)
- [docs/checklist-prs.md](docs/checklist-prs.md)
- [docs/pre-requisitos-implementacao.md](docs/pre-requisitos-implementacao.md)
