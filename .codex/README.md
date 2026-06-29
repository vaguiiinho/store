# Codex Setup

Esta pasta contem a configuracao local de agentes para o Codex.

## Arquivo principal

O arquivo principal para orientacao e `AGENTS.md` na raiz.

## Skills

As skills em `.codex/skills/` sao mantidas aqui como parte do repositorio. Dependendo da instalacao, talvez seja necessario copiá-las para o diretorio pessoal de skills do Codex.

## Recomendacao

Use `.agents/` como fonte compartilhada e mantenha `AGENTS.md` curto, apontando para os arquivos relevantes.

## Custom agents

Os agentes em `.codex/agents/` sao configuracoes de subagents do Codex.

Exemplos:

```text
Spawn the architect agent to create an action plan for this idea.
Spawn the backend agent to shape the domain and API.
Spawn the nestjs-backend agent to design the API modules.
Spawn the frontend agent to structure a UI change.
Spawn the nextjs-frontend agent to plan the frontend structure.
Spawn the qa agent to define test cases.
Spawn the security agent to assess sensitive flows.
Spawn the reviewer agent to review the current changes.
```

No Codex CLI, use `/agent` para alternar entre threads de agentes que ja foram iniciadas.
