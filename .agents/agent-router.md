# Agent Router

Use este guia para escolher o agente certo sem pensar demais.

## Regra rapida

| Situaçao | Agente |
| --- | --- |
| Ideia vaga, escopo ou arquitetura | `architect` |
| API, banco, dominio ou integracao | `backend` |
| Tela, componente, fluxo ou UX | `frontend` |
| App Router, Server Components ou Tailwind | `nextjs-frontend` |
| NestJS, Prisma ou PostgreSQL | `nestjs-backend` |
| Testes, bugs ou criterio de aceite | `qa` |
| Revisao antes de PR ou entrega | `reviewer` |
| Login, permissao, dados sensiveis ou integracao externa | `security` |

## Sequencias comuns

### Nova funcionalidade

1. `architect`
2. `backend` ou `frontend`
3. `nestjs-backend` ou `nextjs-frontend`, se a stack estiver definida
4. `qa`
5. `reviewer`

### Funcionalidade com risco de seguranca

1. `architect`
2. `security`
3. `backend`
4. `nestjs-backend` ou `nextjs-frontend`, conforme a stack
5. `qa`
6. `reviewer`

### Bug em producao

1. `qa`
2. `backend` ou `frontend`
3. `reviewer`

### Tela nova

1. `frontend`
2. `nextjs-frontend`, se for Next.js
3. `qa`
4. `reviewer`

### Endpoint novo

1. `backend`
2. `nestjs-backend`
3. `qa`
4. `reviewer`

## Se estiver em duvida

Comece por `architect`. Ele reduz retrabalho quando a tarefa ainda nao esta bem definida.
