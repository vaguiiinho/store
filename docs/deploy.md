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

Use um arquivo `.env` de deploy com pelo menos:

- `DATABASE_URL`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `PAYMENT_PROVIDER_KEY`
- `PAYMENT_PROVIDER_SECRET`
- `PAYMENT_PROVIDER`
- `PAYMENT_PROVIDER_BASE_URL`
- `PAYMENT_PROVIDER_WEBHOOK_SECRET`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `RESEND_API_KEY`
- `STORAGE_BUCKET`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`

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
