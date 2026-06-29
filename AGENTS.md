# Agent Instructions

Este arquivo e a entrada principal para agentes neste repositorio.

## Como usar

1. Leia `.agents/agent-router.md` para escolher o agente certo.
2. Leia `.agents/operating-principles.md` antes de mudar arquivos.
3. Leia `.agents/project-architecture.md` quando a tarefa envolver Next.js, NestJS, Prisma ou PostgreSQL.
4. Use `.agents/templates/` para briefings e revisoes.

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
