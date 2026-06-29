# Projeto

Este repositório tem uma camada de agentes para ajudar a transformar ideias em requisitos, plano de ação, implementação e revisão.

## Ponto de partida

Se você tem só uma ideia, comece pelo agente `architect`.

Use o `architect` quando você precisar de ajuda para:

- entender o problema;
- levantar requisitos;
- definir escopo de MVP;
- identificar riscos e dependências;
- criar um plano de ação em etapas.

## Como invocar um agente especializado

Se estiver usando o Codex, abra uma thread do agente mais adequado ao tipo de tarefa.

### Exemplos práticos

- `architect`: transformar uma ideia em requisitos e plano técnico.
- `backend`: organizar domínio, APIs, dados e integrações.
- `frontend`: estruturar tela, componente e fluxo de interface.
- `nestjs-backend`: desenhar módulos NestJS, Prisma e PostgreSQL.
- `nextjs-frontend`: planejar frontend Next.js App Router.
- `qa`: definir cenários de teste e critérios de aceite.
- `reviewer`: revisar mudanças antes de PR ou entrega.
- `security`: avaliar dados sensíveis, permissões e riscos.

## Prompts prontos

### Para levantar requisitos

Use algo neste formato:

```text
Você é o agente architect.

Tenho esta ideia: [descreva a ideia].

Quero que você me ajude a:
- entender o problema;
- listar os requisitos funcionais e não funcionais;
- apontar dúvidas em aberto;
- sugerir um MVP;
- indicar riscos e dependências.

Responda em pt-BR, de forma objetiva.
```

### Para criar um plano de ação

```text
Você é o agente architect.

Com base nesta ideia: [descreva a ideia].

Crie um plano de ação com:
- etapas em ordem de execução;
- decisões técnicas importantes;
- riscos e mitigacoes;
- sugestão de quais agentes chamar depois.

Responda em pt-BR, de forma objetiva.
```

### Para seguir depois do planejamento

- Se o problema for de API, chame `backend` ou `nestjs-backend`.
- Se o problema for de interface, chame `frontend` ou `nextjs-frontend`.
- Se o foco for validação, chame `qa`.
- Se houver dados sensíveis ou autenticação, chame `security`.
- Antes de finalizar, chame `reviewer`.

## Fluxo recomendado

1. `architect` para organizar a ideia.
2. Agente especialista para detalhar a execução.
3. `qa` para validar riscos e cenários.
4. `reviewer` para revisar a qualidade final.

## Arquivos úteis

- [.agents/README.md](.agents/README.md)
- [.agents/agent-router.md](.agents/agent-router.md)
- [.agents/project-architecture.md](.agents/project-architecture.md)
- [.agents/templates/task-brief.md](.agents/templates/task-brief.md)
- [.agents/templates/review-request.md](.agents/templates/review-request.md)
- [.codex/README.md](.codex/README.md)

## Documentos do projeto

- [plan.md](plan.md)
- [docs/README.md](docs/README.md)
- [docs/prd-loja-virtual.md](docs/prd-loja-virtual.md)
- [docs/implementacao-tasks.md](docs/implementacao-tasks.md)
