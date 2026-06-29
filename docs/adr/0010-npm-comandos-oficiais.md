# ADR 0010 - npm como Padrao de Comandos

## Contexto

A base do projeto precisa de comandos consistentes e faceis de lembrar.

## Decisao

Adotar `npm` como gerenciador e padrao de comandos do projeto.

## Razao

- Ja e o padrao mais familiar para a maioria dos times.
- Evita dependencia de uma ferramenta extra.
- Mantem os comandos previsiveis para install, dev, test, lint, format e build.

## Alternativas Consideradas

- pnpm.
- yarn.

## Impacto

- O scaffold devera expor scripts padronizados no root.
- A documentacao passa a referenciar comandos baseados em npm.

