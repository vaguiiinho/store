# Docker Optimization

## Estado anterior

Monorepo npm workspaces com Next.js, NestJS/Prisma, PostgreSQL 16 e Nginx. Web e API copiavam dependências do workspace inteiro. Baseline: Web 994 MB e API 1,36 GB.

## Problemas encontrados

- Web sem standalone e com árvore raiz completa no runtime. Impacto alto em disco; risco médio por tracing do monorepo.
- API com dependências do Web e devDependencies. Impacto alto em disco/superfície; risco médio por layout hoisted do Prisma.
- Runtimes como root. Impacto de segurança; risco baixo.
- Sem limites e rotação. Impacto em estabilidade/disco; risco baixo.
- Healthchecks já eram leves; Postgres e APIs internas não publicavam portas, configuração correta preservada.

## Alterações realizadas

Standalone no Web; `npm ci --omit=dev --workspace api` para o runtime da API; Prisma Client gerado copiado explicitamente; runtimes como `node`; `.dockerignore`, limites, heap e logging ajustados.

## Dockerfiles

O Web carrega apenas `.next/standalone`, static e healthcheck. A API carrega somente dependências produtivas do workspace, `dist`, Prisma/migrations e healthcheck. Histórico final: 19 layers Web e 21 API.

## Docker Compose

Quatro serviços independentes. Somente Nginx publica porta (82). Restart existente foi preservado e foram adicionados limites e logging.

## CPU e memória

| Container | RAM observada em idle | Limite RAM | CPU limite | Heap Node |
| --- | ---: | ---: | ---: | ---: |
| Web | 47,0 MiB | 320 MiB | 0,50 | 224 MiB |
| API | 38,7 MiB | 300 MiB | 0,50 | 192 MiB |
| Postgres | 26,1 MiB | 320 MiB | 0,50 | n/a |
| Nginx | 7,1 MiB | 64 MiB | 0,25 | n/a |

## Next.js

Standalone habilitado e validado nas rotas públicas e administrativas através do Nginx.

## Node/NestJS

A instalação de runtime é filtrada para a API e omite devDependencies/root tooling. O build completo continua usando o lockfile raiz.

## Prisma

O Prisma CLI permanece uma dependência produtiva porque `migrate deploy` ocorre no startup. Client gerado e três migrations foram validados.

## Workers

Não há worker neste projeto.

## Logs

Todos os serviços usam `json-file` com 10 MB e três arquivos.

## Healthchecks

Postgres, API e Web ficaram saudáveis; `/` e `/api/health` responderam via Nginx.

## Segurança

Web/API executam como `node`; somente Nginx está publicado; arquivos `.env`, testes, docs, Git e artefatos locais não entram no contexto.

## ARM64

Status: **SIM**, com smoke test nativo pendente. Node 22 Alpine, Postgres 16 Alpine e Nginx possuem manifests arm64; Prisma gera engine da plataforma durante o build, e Sharp possui pacote linuxmusl-arm64 no lockfile.

## Imagens

| Serviço | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| Web | 994 MB | 283 MB | 71,5% |
| API | 1,36 GB | 628 MB | 53,8% |

Conteúdo OCI final: Web 68,8 MB e API 144,8 MB.

## Resultado do build

Compose config, builds, migrations, startup, healthchecks, HTTP e logs passaram. Sem OOM/restart.

## Pontos pendentes

- Validar picos de checkout, geração de imagens e integrações externas sob carga.
- Considerar proxy Nginx global.
- Corrigir vulnerabilidades de dependências em atualização separada.
