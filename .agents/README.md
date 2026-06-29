# Shared Agent Library

Esta pasta concentra a configuracao reutilizavel do ambiente de agentes.

## Estrutura

- `operating-principles.md`: regras gerais de trabalho.
- `agent-router.md`: guia rapido de escolha do agente.
- `project-architecture.md`: arquitetura esperada do projeto.
- `project-context-template.md`: contexto base para novos projetos.
- `specialists/`: perfis especializados.
- `templates/`: briefs e pedidos de revisao.

## Fluxo recomendado

1. Defina o tipo de tarefa.
2. Consulte `agent-router.md`.
3. Leia o especialista correspondente.
4. Use o template correto se estiver abrindo uma tarefa ou revisao.

## Como adaptar

- Atualize `project-architecture.md` quando a stack do projeto mudar.
- Remova especialistas que nao fazem sentido.
- Adicione especialistas de dominio quando houver necessidade real.
- Mantenha cada arquivo curto e acionavel.
