# Deploy com Docker e Nginx

## Objetivo

Subir a loja virtual em ambiente de produção com:

- PostgreSQL;
- API NestJS;
- frontend Next.js;
- Nginx como reverse proxy.

## Arquivos

- `docker-compose.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `deploy/nginx/default.conf`

## Variaveis de ambiente

Crie os arquivos a partir de seus exemplos e preencha os valores de produção:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
mkdir -p deploy/postgres
cp deploy/postgres/.env.example deploy/postgres/.env
```

- `apps/api/.env` contém `DATABASE_URL`, `APP_URL`, `AUTH_SECRET`, credenciais do admin e integrações externas;
- `apps/web/.env` contém `API_URL`, `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_APP_URL`;
- `deploy/postgres/.env` contém `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB`.

## Comandos

Subir a stack:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

Descer a stack:

```bash
docker compose down
```

## Roteamento

- `http://SEU_HOST/` -> frontend Next.js
- `http://SEU_HOST/api/*` -> backend NestJS

## Observacoes

- O frontend consome a API via `/api` no browser.
- O backend consome `DATABASE_URL` apontando para o container PostgreSQL.
- O Nginx é a unica porta publica na stack.
